import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, IconButton, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, Divider, Tooltip, InputAdornment, LinearProgress, Fade
} from "@mui/material";
import { Google, Email, Delete, Edit, CheckCircle, Error as ErrorIcon, Visibility, VisibilityOff } from "@mui/icons-material";

import { addGoogleEmail, addEmailPassword, deleteUserEmail, getAllowedUsers } from "../services/authFirebase";

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function ParametresPage() {
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleStatus, setGoogleStatus] = useState(null);
  const [googleMsg, setGoogleMsg] = useState("");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailMsg, setEmailMsg] = useState("");

  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Charger les utilisateurs autorisés depuis Firestore
    async function fetchUsers() {
      const data = await getAllowedUsers();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleAddGoogle = async () => {
    try {
      const user = await addGoogleEmail(googleEmail);
      setUsers((prev) => [...prev, user]);
      setGoogleStatus("success");
      setGoogleMsg("Ajouté !");
      setGoogleEmail("");
    } catch (err) {
      setGoogleStatus("error");
      setGoogleMsg(err.message);
    }
    setTimeout(() => setGoogleStatus(null), 2000);
  };

  const handleAddEmail = async () => {
    const pwScore = passwordStrength(pw);
    if (pw.length < 6) {
      setEmailStatus("error");
      setEmailMsg("Mot de passe trop faible (6 caractères minimum)");
      return;
    }

    try {
      const user = await addEmailPassword(email, pw);
      setUsers((prev) => [...prev, user]);
      setEmailStatus("success");
      setEmailMsg("Ajouté !");
      setEmail("");
      setPw("");
    } catch (err) {
      setEmailStatus("error");
      setEmailMsg(err.message);
    }
    setTimeout(() => setEmailStatus(null), 2000);
  };

  const handleDelete = async (email) => {
    await deleteUserEmail(email);
    setUsers((prev) => prev.filter((u) => u.email !== email));
  };

  const handleEdit = (user) => {
    setEmail(user.email);
    setPw("");
  };

  const pwScore = passwordStrength(pw);
  const pwColors = ["#eee", "#f44336", "#ff9800", "#ffc107", "#4caf50", "#388e3c"];
  const pwLabels = ["", "Très faible", "Faible", "Moyen", "Bon", "Fort"];

  const isPwValid = pw.length >= 6 || pwScore >= 4;

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
        Gestion des utilisateurs autorisés
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={4}>
        <Paper elevation={2} sx={{ flex: 1, p: 3, bgcolor: "grey.50" }}>
          <Typography variant="h6" mb={2}>Ajouter un email Google</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Email Google"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              size="small"
              fullWidth
              sx={{ bgcolor: "white" }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Google color="primary" /></InputAdornment>
              }}
              error={googleStatus === "error"}
              helperText={googleStatus === "error" ? googleMsg : ""}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ bgcolor: "#4285F4", color: "#fff", "&:hover": { bgcolor: "#357ae8" }, minWidth: 48 }}
              onClick={handleAddGoogle}
              disableElevation
            >
              Autoriser
            </Button>
            <Fade in={!!googleStatus}>
              <Box sx={{ ml: 1 }}>
                {googleStatus === "success" && <CheckCircle color="success" />}
                {googleStatus === "error" && <ErrorIcon color="error" />}
              </Box>
            </Fade>
          </Stack>
          {googleStatus === "success" && <Typography color="success.main" mt={1}>{googleMsg}</Typography>}
        </Paper>

        <Paper elevation={2} sx={{ flex: 1, p: 3, bgcolor: "grey.50" }}>
          <Typography variant="h6" mb={2}>Ajouter un compte Email + Mot de passe</Typography>
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              fullWidth
              sx={{ bgcolor: "white" }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }}
              error={emailStatus === "error"}
              helperText={emailStatus === "error" ? emailMsg : ""}
            />
            <TextField
              label="Mot de passe"
              type={pwVisible ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              size="small"
              fullWidth
              sx={{ bgcolor: "white" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setPwVisible((v) => !v)} edge="end" size="small">
                      {pwVisible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={emailStatus === "error"}
            />
            <Box sx={{ width: "100%", mt: -1 }}>
              <LinearProgress
                variant="determinate"
                value={(pwScore / 5) * 100}
                sx={{
                  height: 6,
                  borderRadius: 2,
                  bgcolor: "#eee",
                  "& .MuiLinearProgress-bar": { bgcolor: pwColors[pwScore] }
                }}
              />
              <Typography
                variant="caption"
                color={pwScore < 4 ? "error" : "success.main"}
                sx={{ ml: 1 }}
              >
                {pwLabels[pwScore]}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddEmail}
              disabled={!isPwValid}
              sx={{ mt: 1 }}
            >
              Ajouter compte
            </Button>
            {emailStatus === "success" && <Typography color="success.main">{emailMsg}</Typography>}
          </Stack>
        </Paper>
      </Stack>

      <Paper elevation={2} sx={{ p: 3, bgcolor: "white" }}>
        <Typography variant="h6" mb={2}>Utilisateurs autorisés</Typography>
        <List>
          {users.map((user, idx) => (
            <React.Fragment key={user.email}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Éditer">
                      <IconButton onClick={() => handleEdit(user)}><Edit color="primary" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDelete(user.email)}><Delete color="error" /></IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: user.method === "google" ? "#4285F4" : "secondary.main" }}>
                    {user.method === "google" ? <Google /> : <Email />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.email}
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      {user.method === "google" ? <>
                        <Google fontSize="small" sx={{ mr: 0.5 }} /> Connexion Google
                      </> : <>
                        <Email fontSize="small" sx={{ mr: 0.5 }} /> Email + Mot de passe
                      </>}
                    </Typography>
                  }
                />
              </ListItem>
              {idx < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
