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
import { Delete, Edit } from "@mui/icons-material";

import DocumentPage from "../components/DocumentPage/index.jsx";

import {
  deleteDocument,
  getPensionsDocuments,
  updateDocument,
} from "../services/solde.js";

import { showConfirm, showToast, showToastErr } from "../utils/alerts.js";
import { useHeaderVisibility } from "../contexts/HeaderVisibilityContext.jsx";
import { useSearch } from "../contexts/SearchContext";

// Normalisation pour "reference"
const normalizeRefs = (ref) => {
  if (Array.isArray(ref)) return ref;
  if (!ref) return [];
  return [ref];
};

export default function PensionsPage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUpdateDoc, setSelectedUpdateDoc] = useState(null);
  const [references, setReferences] = useState([]);

  // 🔥 Debounced search (exactement comme Solde)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { search } = useSearch();

  const { setShowHeader } = useHeaderVisibility();

  useEffect(() => {
    setShowHeader(!showForm);
    return () => setShowHeader(true);
  }, [showForm]);

  const handleAddClick = () => setShowForm(true);

  const handleCancel = () => {
    setShowForm(false);
    setSelectedUpdateDoc(null);
  };

  // ------------------------------
  // 🔥 SUBMIT FORM
  // ------------------------------
  const handleSubmit = async (data, mode) => {
    data.reference = normalizeRefs(data.reference);

    if (mode === "update") {
      try {
        await updateDocument(data.id, data);

        setDocuments((prev) =>
          prev.map((d) => (d.id === data.id ? { ...d, ...data } : d))
        );

        showToast("Document modifié avec succès", "success");
      } catch (err) {
        console.error(err);
        showToastErr("Erreur lors de la modification");
      }

      setShowForm(false);
      setSelectedUpdateDoc(null);
      return;
    }

    // CREATE
    try {
      const docs = await getPensionsDocuments();

      const cleaned = docs.map((d) => ({
        ...d,
        id: d.id,
        reference: normalizeRefs(d.reference),
      }));

      setDocuments(cleaned);
      showToast("Document enregistré avec succès", "success");
    } catch (err) {
      console.error(err);
      showToastErr("Erreur lors de l'enregistrement");
    }

    setShowForm(false);
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

      showToast("Document supprimé avec succès", "success");
    } catch (err) {
      console.error(err);
      showToastErr("Impossible de supprimer le document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = (docId) => {
    const doc = documents.find((d) => d.id === docId);

    const fixed = {
      ...doc,
      reference: normalizeRefs(doc.reference),
    };

    setSelectedUpdateDoc(fixed);
    setShowForm(true);
  };

  // ------------------------------
  // 🔥 LOAD DOCUMENTS
  // ------------------------------
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const docs = await getPensionsDocuments();

        const cleanDocs = docs.map((d) => ({
          ...d,
          id: d.id,
          reference: normalizeRefs(d.reference),
        }));

        setDocuments(cleanDocs);

        // Récupération des références
        let refs = [];
        cleanDocs.forEach((doc) => refs.push(...normalizeRefs(doc.reference)));

        refs = [...new Set(refs.filter((e) => e && e.trim() !== ""))];

        setReferences(
          refs.map((r) => ({
            id: crypto.randomUUID(),
            label: r,
          }))
        );
      } catch (err) {
        console.error(err);
        showToastErr("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // ------------------------------
  // 🔥 Debounce (300 ms)
  // ------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ------------------------------
  // 🔥 SEARCH FILTER (identique à Solde)
  // ------------------------------
  useEffect(() => {
    if (!debouncedSearch) {
      setFilteredDocs(documents);
      return;
    }

    const term = debouncedSearch.toLowerCase();

    const filtered = documents.filter((doc) => {
      if (doc.nature?.toLowerCase().includes(term)) return true;

      if (doc.reference.some((r) => r.toLowerCase().includes(term))) return true;

      if (doc.titres?.length > 0) {
        for (const t of doc.titres) {
          if (t.titre?.toLowerCase().includes(term)) return true;

          if (t.pieceType?.toLowerCase().includes(term)) return true;

          if (t.sousTitres?.length > 0) {
            for (const st of t.sousTitres) {
              if (st.sousTitre?.toLowerCase().includes(term)) return true;

              if (st.pieces?.some((p) => p.toLowerCase().includes(term)))
                return true;
            }
          }
        }
      }

      return false;
    });

    setFilteredDocs(filtered);
  }, [debouncedSearch, documents]);

  // ------------------------------
  // 🔥 Skeleton
  // ------------------------------
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
        </Card>
      ))}
    </Stack>
  );

  return (
    <Fade in timeout={400}>
      <Box sx={{ p: 0 }}>
        {showForm ? (
          <>
            <Stack direction="row" spacing={1} mb={2} alignItems="center">
              <Tooltip title="Retour à la liste">
                <IconButton onClick={handleCancel}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="h5">
                {selectedUpdateDoc
                  ? "Modifier un document de pensions"
                  : "Nouveau document de pensions"}
              </Typography>
            </Stack>

            <DocumentPage
              initialType="pension"
              references={references}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              updateDoc={selectedUpdateDoc}
            />
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
              <Typography variant="h4">
                Gestion des documents de pensions
              </Typography>

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
            ) : filteredDocs.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                <Typography>Aucun document trouvé.</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredDocs.map((doc) => (
                  <Card key={doc.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6">{doc.nature}</Typography>
                      </Stack>

                      {doc.titres?.length > 0 && (
                        <Box mt={2}>
                          {doc.titres.map((t, ti) => (
                            <Box key={ti} mb={1}>
                              {t.titre && (
                                <Typography fontWeight={600}>
                                  • {t.titre}
                                </Typography>
                              )}

                              {t.pieceType && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  ml={2}
                                >
                                  <strong>Type de pièces :</strong>{" "}
                                  {t.pieceType}
                                </Typography>
                              )}

                              {t.sousTitres?.map((st, si) => (
                                <Box key={si} ml={2}>
                                  {st.sousTitre && (
                                    <Typography>- {st.sousTitre}</Typography>
                                  )}
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

                      <Typography variant="body2" color="text.secondary" mt={1}>
                        <strong>Références :</strong>{" "}
                        {doc.reference.length > 0
                          ? doc.reference.join(", ")
                          : "—"}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={() => handleUpdate(doc.id)}
                      >
                        Modifier
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
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
