import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Fade,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import DocumentPage from "../components/DocumentPage/index.jsx";
import { deleteDocument, getSoldeDocuments, updateDocument } from "../services/solde.js";
import { showConfirm, showToast, showToastErr } from "../utils/alerts.js";
import { useHeaderVisibility } from "../contexts/HeaderVisibilityContext.jsx";
import { useSearch } from "../contexts/SearchContext";

export default function SoldesPage() {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedUpdateDoc, setSelectedUpdateDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [references, setReferences] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  // 🔥 Ajout pour supprimer l'input lag
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { setShowHeader } = useHeaderVisibility();
  const { search } = useSearch();

  useEffect(() => {
    setShowHeader(!showForm);
    return () => setShowHeader(true);
  }, [showForm]);
  useEffect(() => {
  const fetchDocs = async () => {
    const docs = await getSoldeDocuments();
    console.log("Docs reçus du backend :", docs);
  };
  fetchDocs();
}, []);


  // ========= NORMALISATION DES REFERENCES =========
  const normalizeRefs = (ref) => {
    if (Array.isArray(ref)) return ref;
    if (!ref) return [];
    return [ref];
  };

  // === HANDLERS ===
  const handleAddClick = () => setShowForm(true);

  const handleCancel = () => {
    setShowForm(false);
    setSelectedUpdateDoc(null);
  };

  const handleSubmit = async (data, mode) => {
    data.reference = normalizeRefs(data.reference);

    if (mode === "update") {
      try {
        console.log("Mise à jour du document :", data);
        await updateDocument(data.id, data);

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === data.id
              ? { ...d, ...data, id: d.id } // 🔥 ID toujours conservé
              : d
          )
        );


        showToast("Document modifié avec succès", "success");
      } catch (err) {
        console.error(err);
        showToastErr("Impossible de modifier le document");
      }

      setShowForm(false);
      setSelectedUpdateDoc(null);
      return;
    }

    // CREATE
    try {
      const docs = await getSoldeDocuments();
      const cleaned = docs.map((d) => ({
        ...d,
        id: d.id || crypto.randomUUID(),
        reference: normalizeRefs(d.reference),
      }));

      setDocuments(cleaned);
      showToast("Document enregistré avec succès", "success");
    } catch (err) {
      console.error(err);
      showToastErr("Impossible d'enregistrer le document");
    }

    setShowForm(false);
  };

  const handleUpdate = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    console.log("Document à modifier :", doc);
    const docFixed = {
      ...doc,
      reference: normalizeRefs(doc.reference),
    };

    console.log("Document après normalisation des références :", docFixed);

    setSelectedUpdateDoc(docFixed);
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

      showToast("Document supprimé avec succès", "success");
    } catch (err) {
      console.error(err);
      showToastErr("Impossible de supprimer le document");
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
        const cleanDocs = docs.map((d) => ({
          ...d,
          reference: normalizeRefs(d.reference),
        }));

        
        setDocuments(cleanDocs);

        console.log(cleanDocs);
        
        // Extraction des références
        let allRefs = [];
        cleanDocs.forEach((doc) => {
          const ref = doc.reference;
          if (!ref) return;
          if (Array.isArray(ref)) {
            allRefs.push(...ref);
          } else {
            allRefs.push(ref);
          }
        });

        allRefs = allRefs
          .map((r) => (typeof r === "string" ? r.trim() : ""))
          .filter((r) => r !== "");
        const uniqueRefs = [...new Set(allRefs)];
        const formatted = uniqueRefs.map((ref) => ({
          id: crypto.randomUUID(),
          label: ref,
        }));
        setReferences(formatted);
      } catch (err) {
        console.error(err);
        showToastErr("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // 🔥 DEBOUNCE de la recherche pour enlever le lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // === SEARCH FILTER ===
  useEffect(() => {
    if (!debouncedSearch) {
      setFilteredDocs(documents);
      return;
    }

    const term = debouncedSearch.toLowerCase();

    setFilteredDocs(
      documents.filter(
        (doc) =>
          doc.nature?.toLowerCase().includes(term) ||
          (doc.reference || []).some((r) => r.toLowerCase().includes(term)) ||
          doc.titres?.some((t) =>
            t.titre?.toLowerCase().includes(term) ||
            t.pieceType?.toLowerCase().includes(term) ||
            t.sousTitres?.some((st) =>
              st.sousTitre?.toLowerCase().includes(term) ||
              st.pieces?.some((p) => p.toLowerCase().includes(term))
            )
          )
      )
    );
  }, [debouncedSearch, documents]);

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
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mt: 1, borderRadius: 1 }}
            />
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
                {selectedUpdateDoc
                  ? "Modifier un document de solde"
                  : "Nouveau document de solde"}
              </Typography>
            </Stack>

              <DocumentPage
                type="solde"
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
                {filteredDocs.map((doc) => (
                  <Card key={doc.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6">{doc.nature}</Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Références :</strong>{" "}
                        {doc.reference?.length > 0
                          ? doc.reference.join(", ")
                          : "—"}
                      </Typography>

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
                                <Typography variant="body2" color="text.secondary" ml={2}>
                                  <strong>Type de pièces :</strong> {t.pieceType}
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
