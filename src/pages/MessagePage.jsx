import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Checkbox,
  IconButton,
  Alert,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import CloseIcon from "@mui/icons-material/Close";

// 💡 Icônes Lucide React
import { Mail, MailCheck, Inbox } from "lucide-react";

import {
  getReceiverEmail,
  setReceiverEmail,
  getMessages,
  deleteMessage,
} from "../services/solde";

import { showConfirm, showToastErr, showToast } from "../utils/alerts";

export default function MessagePage() {
  const DEFAULT_RECEIVER_EMAIL = "service@exemple.com";

  const [receiverEmail, setReceiverEmailState] = useState(DEFAULT_RECEIVER_EMAIL);
  const [emailInput, setEmailInput] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messageDeletionLoading, setMessageDeletionLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());

  const fetchMessages = async () => {
    setMessagesLoading(true);
    setMessageError("");

    try {
      const data = await getMessages();
      setMessages(data);
    } catch {
      setMessages([]);
      setMessageError("Erreur lors du chargement des messages.");
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      setEmailLoading(true);
      const email = await getReceiverEmail(DEFAULT_RECEIVER_EMAIL);
      setReceiverEmailState(email);
      setEmailInput(email);
      setEmailLoading(false);
    };
    fetchEmail();
  }, []);

  const handleSaveEmail = async () => {
    if (!emailInput.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(emailInput.trim())) {
      setEmailError("Adresse email invalide");
      return;
    }
    setEmailSaving(true);
    setEmailError("");

    try {
      await setReceiverEmail(emailInput.trim());
      setReceiverEmailState(emailInput.trim());
    } catch {
      setEmailError("Erreur lors de la sauvegarde");
    } finally {
      setEmailSaving(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleMessageSelection = (messageId) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      next.has(messageId) ? next.delete(messageId) : next.add(messageId);
      return next;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedMessageIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.size === messages.length) {
      setSelectedMessageIds(new Set());
    } else {
      setSelectedMessageIds(new Set(messages.map((m) => m.id)));
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessageIds.size === 0) return;

    const ok = await showConfirm(
      `Supprimer ${selectedMessageIds.size} message(s) ?`,
      "warning",
      "Supprimer",
      "Cette action est irréversible."
    );
    if (!ok) return;

    setMessageDeletionLoading(true);

    try {
      await Promise.all(
        [...selectedMessageIds].map((id) => deleteMessage(id))
      );

      setMessages((prev) =>
        prev.filter((msg) => !selectedMessageIds.has(msg.id))
      );

      setSelectedMessageIds(new Set());
      setIsSelectionMode(false);
      showToast("Messages supprimés !");
    } catch {
      setMessageError("Erreur lors de la suppression des messages.");
      showToastErr("Erreur lors de la suppression !");
    } finally {
      setMessageDeletionLoading(false);
    }
  };

  const allSelected =
    messages.length > 0 && selectedMessageIds.size === messages.length;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* SECTION EMAIL */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <MailCheck size={22} />
          <Typography variant="h6">Adresse email de réception</Typography>
        </Stack>

        {emailLoading ? (
          <CircularProgress size={26} />
        ) : (
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Email de réception"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              size="small"
              error={!!emailError}
              helperText={emailError}
              sx={{ minWidth: 350 }}
            />

            <Button
              variant="contained"
              onClick={handleSaveEmail}
              disabled={emailSaving}
            >
              {emailSaving && <CircularProgress size={18} sx={{ mr: 1 }} />}
              Enregistrer
            </Button>

            <Typography variant="body2" color="text.secondary">
              Email actuel : <b>{receiverEmail}</b>
            </Typography>
          </Stack>
        )}
      </Paper>

      {/* SECTION MESSAGES */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Inbox size={22} />
          <Typography variant="h6">Liste des messages</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography></Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            {isSelectionMode ? (
              <>
                <IconButton onClick={handleSelectAll}>
                  <Checkbox checked={allSelected} />
                </IconButton>

                <Typography>{selectedMessageIds.size} sélectionné(s)</Typography>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteMessages}
                  disabled={
                    selectedMessageIds.size === 0 || messageDeletionLoading
                  }
                  startIcon={
                    messageDeletionLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <DeleteIcon />
                    )
                  }
                >
                  Supprimer
                </Button>

                <IconButton onClick={toggleSelectionMode}>
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              messages.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<SelectAllIcon />}
                  onClick={toggleSelectionMode}
                >
                  Sélectionner
                </Button>
              )
            )}
          </Stack>
        </Stack>

        {messageError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {messageError}
          </Alert>
        )}

        {messagesLoading ? (
          <CircularProgress size={30} />
        ) : messages.length === 0 ? (
          <Typography>Aucun message reçu.</Typography>
        ) : (
          <List>
            {messages.map((msg) => {
              const selected = selectedMessageIds.has(msg.id);

              return (
                <React.Fragment key={msg.id}>
                  <ListItem
                    sx={{
                      bgcolor: selected ? "rgba(0,0,0,0.05)" : "transparent",
                      borderRadius: 1,
                      cursor: isSelectionMode ? "pointer" : "default",
                      transition: "0.2s",
                    }}
                    onClick={
                      isSelectionMode
                        ? () => handleToggleMessageSelection(msg.id)
                        : undefined
                    }
                  >
                    {isSelectionMode && (
                      <Checkbox checked={selected} tabIndex={-1} />
                    )}

                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <b>{msg.name}</b>
                          <Typography color="text.secondary">
                            {msg.email}
                          </Typography>
                          {msg.phone && (
                            <Typography color="text.secondary">
                              {msg.phone}
                            </Typography>
                          )}
                          <Typography color="text.secondary">
                            {msg.date
                              ? new Date(msg.date).toLocaleString()
                              : ""}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
                          {msg.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
