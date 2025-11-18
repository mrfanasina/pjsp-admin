import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Fade,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Skeleton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import DocumentPage from "../components/DocumentPage/index.jsx";
import { deleteDocument, getSoldeDocuments, updateDocument } from "../services/solde.js";
import { showConfirm, showToast, showToastErr } from "../utils/alerts.js";

export default function SoldesPage() {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedUpdateDoc, setSelectedUpdateDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const references = [
    { id: "solde-123", label: "Solde N°12345" },
    { id: "solde-124", label: "Solde N°12458" },
  ];

  // === HANDLERS ===
  const handleAddClick = () => setShowForm(true);

  const handleCancel = () => {
    setShowForm(false);
    setSelectedUpdateDoc(null);
  };

  const handleSubmit = async (data, mode) => {
    if (mode === "update") {
      try {
        await updateDocument(data.id, data);
        setDocuments((prev) =>
          prev.map((d) => (d.id === data.id ? { ...d, ...data } : d))
        );
        setToast("✅ Document modifié avec succès");
      } catch (err) {
        console.error(err);
        showToastErr("❌ Impossible de modifier le document");
      }

      setShowForm(false);
      setSelectedUpdateDoc(null);
      return;
    }

    // CREATE
    try {
      const docs = await getSoldeDocuments();
      setDocuments(docs);
      setToast("✅ Document enregistré avec succès");
    } catch (err) {
      console.error(err);
      showToastErr("❌ Impossible d'enregistrer le document");
    }

    setShowForm(false);
  };

  const handleUpdate = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    setSelectedUpdateDoc(doc);
    setShowForm(true);
  };

  const handleDelete = async (docId) => {
    try {
      const confirm = await showConfirm(
        "Confirmer la suppression ?",
        "warning",
        "Oui, supprimer",
        "Cette action est irréversible."
      );
      if (!confirm) return;

      setDeletingId(docId);

      await deleteDocument(docId);

      setDocuments((prev) => prev.filter((d) => d.id !== docId));

      // surtout pas "await showToast()"
      showToast("Document supprimé avec succès", "success");
    } catch (err) {
      console.error(err);
      showToastErr("❌ Impossible de supprimer le document");
    } finally {
      setDeletingId(null);
    }
  };

  // === LOAD DOCUMENTS ===
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const docs = await getSoldeDocuments();

        // sécurité: si Firestore renvoie des docs sans id
        const cleanDocs = docs.map((d) => ({
          ...d,
          id: d.id || crypto.randomUUID(),
        }));

        setDocuments(cleanDocs);
      } catch (err) {
        console.error(err);
        showToastErr("❌ Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // === SKELETON ===
  const renderSkeleton = () => (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Stack>
          <Box mt={2}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
          <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
            <Skeleton variant="rectangular" width={80} height={30} />
            <Skeleton variant="rectangular" width={80} height={30} />
          </Stack>
        </Card>
      ))}
    </Stack>
  );

  // === RENDER ===
  return (
    <Fade in timeout={400}>
      <Box sx={{ width: "100%", px: 2 }}>
        {showForm ? (
          <>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Tooltip title="Retour à la liste">
                <IconButton onClick={handleCancel}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="h5">
                {selectedUpdateDoc ? "Modifier un document de solde" : "Nouveau document de solde"}
              </Typography>
            </Stack>

            <Paper elevation={2} sx={{ p: 3 }}>
              <DocumentPage
                type="solde"
                references={references}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                updateDoc={selectedUpdateDoc}
              />
            </Paper>
          </>
        ) : (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              mb={3}
              spacing={2}
            >
              <Typography variant="h4">Gestion des documents de solde</Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{ borderRadius: 2 }}
              >
                Ajouter un document
              </Button>
            </Stack>

            {loading ? (
              renderSkeleton()
            ) : documents.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                <Typography>Aucun document enregistré.</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {documents.map((doc) => (
                  <Card key={doc.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6">{doc.nature}</Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Type :</strong> {doc.pieceType || "—"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Référence :</strong> {doc.reference || "—"}
                      </Typography>

                      {doc.titres?.length > 0 && (
                        <Box mt={2}>
                          {doc.titres.map((t, ti) => (
                            <Box key={ti} mb={1}>
                              {t.titre && <Typography fontWeight={600}>• {t.titre}</Typography>}
                              {t.sousTitres?.map((st, si) => (
                                <Box key={si} ml={2}>
                                  {st.sousTitre && <Typography>- {st.sousTitre}</Typography>}
                                  {st.pieces?.map((p, pi) => (
                                    <Typography key={pi} variant="body2" ml={3}>
                                      • {p}
                                    </Typography>
                                  ))}
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleUpdate(doc.id)}
                      >
                        Modifier
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={deletingId === doc.id ? null : <DeleteIcon />}
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            Suppression...
                          </>
                        ) : (
                          "Supprimer"
                        )}
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Fade>
  );
}
