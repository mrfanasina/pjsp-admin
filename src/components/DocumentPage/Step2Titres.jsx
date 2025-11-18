import React from "react";
import {
  Stack,
  TextField,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Plus, Trash } from "lucide-react";
import { showToast, showConfirm, showAlert } from "../../utils/alerts";

export default function Step2Titres({ titres, setTitres }) {
  
  // === Ajout d’un titre ===
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
    setTitres((prev) => prev.filter((_, i) => i !== index));
    showToast("Titre supprimé", "info");
  };

  const handleChangeTitre = (index, value) => {
    const newTitres = structuredClone(titres);
    newTitres[index].titre = value;
    setTitres(newTitres);
  };

  // === Ajout d’un sous-titre ===
  const handleAddSousTitre = (titreIndex) => {
    const newTitres = structuredClone(titres);
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
      "Toutes les pièces associées seront perdues."
    );
    if (!confirmed) return;
    const newTitres = structuredClone(titres);
    newTitres[titreIndex].sousTitres.splice(sousIndex, 1);
    setTitres(newTitres);
    showToast("Sous-titre supprimé", "info");
  };

  const handleChangeSousTitre = (titreIndex, sousIndex, value) => {
    const newTitres = structuredClone(titres);
    newTitres[titreIndex].sousTitres[sousIndex].sousTitre = value;
    setTitres(newTitres);
  };

  // === Gestion des pièces ===
  const handleAddPiece = (titreIndex, sousIndex) => {
    const newTitres = structuredClone(titres);
    const sous = newTitres[titreIndex].sousTitres[sousIndex];

    if (!sous.pieceInput.trim())
      return showAlert("Erreur", "Veuillez saisir un nom de pièce", "warning");

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

    const newTitres = structuredClone(titres);
    newTitres[titreIndex].sousTitres[sousIndex].pieces.splice(pieceIndex, 1);
    setTitres(newTitres);
    showToast("Pièce supprimée", "info");
  };

  return (
    <Stack spacing={3} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
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
              label={`Titre ${tIdx + 1}`}
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
              {/* Sous-titre */}
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label={`Sous-titre ${sIdx + 1}`}
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

              {/* Ajouter une pièce */}
              <Stack direction="row" spacing={1} mb={2}>
                <TextField
                  fullWidth
                  label="Nouvelle pièce"
                  value={sous.pieceInput}
                  onChange={(e) => {
                    const newTitres = structuredClone(titres);
                    newTitres[tIdx].sousTitres[sIdx].pieceInput = e.target.value;
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
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleAddSousTitre(tIdx)}
          >
            Ajouter un sous-titre
          </Button>
        </Paper>
      ))}

      <Button variant="outlined" startIcon={<Plus />} onClick={handleAddTitre}>
        Ajouter un nouveau titre
      </Button>
    </Stack>
  );
}
