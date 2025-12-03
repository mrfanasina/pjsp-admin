import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import { Plus, Trash } from "lucide-react";
import { DocumentScanner } from "@mui/icons-material";
import { showAlert, showConfirm, showToast, showError } from "../utils/alerts";
import { addDocument } from "../services/solde";

export default function DocumentPage({
  type = "solde",
  references = [],
  onCancel,
  onSubmit,
}) {
  const [nature, setNature] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [reference, setReference] = useState(null);
  const [titres, setTitres] = useState([
    { titre: "", sousTitres: [{ sousTitre: "", pieces: [], pieceInput: "" }] },
  ]);
  const [loading, setLoading] = useState(false);

  // === Gestion des titres ===
  const handleAddTitre = () => {
    setTitres((prev) => [
      ...prev,
      { titre: "", sousTitres: [{ sousTitre: "", pieces: [], pieceInput: "" }] },
    ]);
    showToast("Nouveau titre ajouté", "info");
  };

  const handleRemoveTitre = async (index) => {
    const confirmed = await showConfirm(
      "Supprimer ce titre ?",
      "warning",
      "Oui, supprimer",
      "Tous les sous-titres et pièces seront perdus."
    );
    if (!confirmed) return;
    const newTitres = [...titres];
    newTitres.splice(index, 1);
    setTitres(newTitres);
    showToast("Titre supprimé", "info");
  };

  const handleChangeTitre = (index, value) => {
    const newTitres = [...titres];
    newTitres[index].titre = value;
    setTitres(newTitres);
  };

  // === Gestion des sous-titres ===
  const handleAddSousTitre = (titreIndex) => {
    const newTitres = [...titres];
    newTitres[titreIndex].sousTitres.push({
      sousTitre: "",
      pieces: [],
      pieceInput: "",
    });
    setTitres(newTitres);
    showToast("Nouveau sous-titre ajouté", "info");
  };

  const handleRemoveSousTitre = async (titreIndex, sousIndex) => {
    const confirmed = await showConfirm(
      "Supprimer ce sous-titre ?",
      "warning",
      "Oui, supprimer",
      "Toutes les pièces de ce sous-titre seront perdues."
    );
    if (!confirmed) return;
    const newTitres = [...titres];
    newTitres[titreIndex].sousTitres.splice(sousIndex, 1);
    setTitres(newTitres);
    showToast("Sous-titre supprimé", "info");
  };

  const handleChangeSousTitre = (titreIndex, sousIndex, value) => {
    const newTitres = [...titres];
    newTitres[titreIndex].sousTitres[sousIndex].sousTitre = value;
    setTitres(newTitres);
  };

  // === Gestion des pièces ===
  const handleAddPiece = (titreIndex, sousIndex) => {
    const newTitres = [...titres];
    const sous = newTitres[titreIndex].sousTitres[sousIndex];
    if (!sous.pieceInput.trim())
      return showAlert("Erreur", "Veuillez saisir le nom de la pièce", "warning");

    sous.pieces.push(sous.pieceInput.trim());
    sous.pieceInput = "";
    setTitres(newTitres);
  };

  const handleRemovePiece = async (titreIndex, sousIndex, pieceIndex) => {
    const confirmed = await showConfirm(
      "Supprimer cette pièce ?",
      "warning",
      "Oui, supprimer",
      "Cette action est irréversible."
    );
    if (!confirmed) return;
    const newTitres = [...titres];
    newTitres[titreIndex].sousTitres[sousIndex].pieces.splice(pieceIndex, 1);
    setTitres(newTitres);
    showToast("Pièce supprimée", "info");
  };

  // === Soumission ===
  const handleSubmit = async () => {
    if (!nature.trim())
      return showAlert("Erreur", "La nature est obligatoire", "error");
    if (type === "solde" && !pieceType)
      return showAlert("Erreur", "Le type de pièces est obligatoire", "error");

    try {
      setLoading(true);
      const data = {
        type,
        nature,
        pieceType: type === "solde" ? pieceType : null,
        reference,
        titres: titres.map(({ titre, sousTitres }) => ({
          titre,
          sousTitres: sousTitres.map(({ sousTitre, pieces }) => ({
            sousTitre,
            pieces,
          })),
        })),
      };
      await addDocument(data);
      showToast("Document enregistré avec succès 🎉");
      onSubmit?.(data);
    } catch {
      showError("Impossible d’enregistrer le document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* === HEADER === */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <DocumentScanner color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight={600} color="primary">
            {type === "solde"
              ? "Ajout de documents de solde"
              : "Ajout de documents de pension"}
          </Typography>
        </Stack>

        {/* Boutons déplacés ici */}
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="error" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Stack>
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "0.35fr 0.65fr" }}
        gap={4}
      >
        {/* === COLONNE GAUCHE === */}
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Nature *"
            value={nature}
            onChange={(e) => setNature(e.target.value)}
            size="small"
          />

          {type === "solde" && (
            <FormControl fullWidth size="small">
              <InputLabel>Type de pièces *</InputLabel>
              <Select
                value={pieceType}
                label="Type de pièces *"
                onChange={(e) => setPieceType(e.target.value)}
              >
                <MenuItem value="">-- Choisir --</MenuItem>
                <MenuItem value="Pièces requises pour visa">
                  Pièces requises pour visa
                </MenuItem>
                <MenuItem value="Pièces Mandatement">
                  Pièces Mandatement
                </MenuItem>
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Référence</InputLabel>
            <Select
              value={reference || ""}
              label="Référence"
              onChange={(e) => setReference(e.target.value)}
            >
              <MenuItem value="">-- Aucune --</MenuItem>
              {references.map((ref) => (
                <MenuItem key={ref.id} value={ref.id}>
                  {ref.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* === COLONNE DROITE === */}
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
          {titres.map((titreBloc, tIdx) => (
            <Paper
              key={tIdx}
              variant="outlined"
              sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}
            >
              {/* === Titre === */}
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label={`Titre ${tIdx + 1} (optionnel)`}
                  value={titreBloc.titre}
                  onChange={(e) => handleChangeTitre(tIdx, e.target.value)}
                  size="small"
                />
                <Tooltip title="Supprimer le titre">
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveTitre(tIdx)}
                    size="small"
                  >
                    <Trash size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* === Sous-titres === */}
              {titreBloc.sousTitres.map((sous, sIdx) => (
                <Paper
                  key={sIdx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: "white",
                    borderColor: "grey.300",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <TextField
                      fullWidth
                      label={`Sous-titre ${sIdx + 1} (optionnel)`}
                      value={sous.sousTitre}
                      onChange={(e) =>
                        handleChangeSousTitre(tIdx, sIdx, e.target.value)
                      }
                      size="small"
                    />
                    <Tooltip title="Supprimer le sous-titre">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveSousTitre(tIdx, sIdx)}
                      >
                        <Trash size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Stack direction="row" spacing={1} mb={2}>
                    <TextField
                      fullWidth
                      label="Nouvelle pièce"
                      value={sous.pieceInput}
                      onChange={(e) => {
                        const newTitres = [...titres];
                        newTitres[tIdx].sousTitres[sIdx].pieceInput =
                          e.target.value;
                        setTitres(newTitres);
                      }}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Plus size={16} />}
                      onClick={() => handleAddPiece(tIdx, sIdx)}
                    >
                      Ajouter
                    </Button>
                  </Stack>

                  {/* Liste des pièces */}
                  {sous.pieces.length > 0 && (
                    <Stack spacing={1}>
                      {sous.pieces.map((p, pIdx) => (
                        <Paper
                          key={pIdx}
                          variant="outlined"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            px: 2,
                            py: 1,
                          }}
                        >
                          <Typography variant="body2">{p}</Typography>
                          <Tooltip title="Supprimer la pièce">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleRemovePiece(tIdx, sIdx, pIdx)
                              }
                            >
                              <Trash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              ))}

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Plus />}
                onClick={() => handleAddSousTitre(tIdx)}
              >
                Ajouter un sous-titre
              </Button>
            </Paper>
          ))}

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Plus />}
            onClick={handleAddTitre}
          >
            Ajouter un nouveau titre
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />
    </Box>
  );
}
