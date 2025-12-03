import React, { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Box,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import {
  Plus,
  Trash,
  X,
  BookOpen,
  List,
  Check,
  Pencil,
} from "lucide-react";
import { showToast, showConfirm } from "../../utils/alerts";

export default function Step2Titres({ titres, setTitres, type }) {
  const [editingPiece, setEditingPiece] = useState(null);
  const [editValue, setEditValue] = useState("");

  const clone = (v) => structuredClone(v);

  // ===========================
  // 🔹 AJOUT NOUVEAU TITRE
  // ===========================
  const addTitre = () => {
    const newTitre = {
      id: Date.now(),
      titre: "",
      pieceType: type === "solde" ? "visa" : undefined,
      sousTitres: [
        { id: Date.now() + 1, sousTitre: "", pieces: [], pieceInput: "" },
      ],
    };
    setTitres((prev) => [...(prev || []), newTitre]);
    showToast("Titre ajouté", "info");
  };

  const removeTitre = async (index) => {
    const ok = await showConfirm(
      "Supprimer ce titre ?",
      "warning",
      "Oui",
      "Toutes les données seront perdues."
    );
    if (!ok) return;
    setTitres((p) => p.filter((_, i) => i !== index));
    showToast("Titre supprimé.", "success");
  };

  const changeTitre = (index, value) => {
    const list = clone(titres);
    if (list[index]) {
      list[index].titre = value;
      setTitres(list);
    }
  };

  const changeTypePiece = (index, value) => {
    const list = clone(titres);
    if (list[index]) {
      list[index].pieceType = value;
      setTitres(list);
    }
  };

  // Assure que tous les titres ont un pieceType par défaut
  React.useEffect(() => {
    if (type === "solde") {
      const fixed = (titres || []).map(t => ({
        ...t,
        pieceType: t.pieceType || "visa",
      }));
      setTitres(fixed);
    }
  }, []);


  // ===========================
  // 🔹 SOUS-TITRES
  // ===========================
  const addSousTitre = (tidx) => {
    const list = clone(titres);
    list[tidx].sousTitres.push({
      id: Date.now(),
      sousTitre: "",
      pieces: [],
      pieceInput: "",
    });
    setTitres(list);
  };

  const removeSousTitre = async (tidx, sidx) => {
    const ok = await showConfirm("Supprimer ce sous-titre ?", "warning", "Oui", "Irréversible");
    if (!ok) return;
    const list = clone(titres);
    list[tidx].sousTitres.splice(sidx, 1);
    setTitres(list);
  };

  const changeSousTitre = (tidx, sidx, val) => {
    const list = clone(titres);
    list[tidx].sousTitres[sidx].sousTitre = val;
    setTitres(list);
  };

  // ===========================
  // 🔹 PIÈCES
  // ===========================
  const addPiece = (tidx, sidx) => {
    const list = clone(titres);
    const st = list[tidx].sousTitres[sidx];
    const trimmedInput = (st.pieceInput || "").trim();
    if (!trimmedInput) return;

    if (!st.pieces) st.pieces = [];
    if (st.pieces.includes(trimmedInput)) {
      st.pieceInput = "";
      setTitres(list);
      return;
    }

    st.pieces.push(trimmedInput);
    st.pieceInput = "";
    setTitres(list);
  };

  const removePiece = (tidx, sidx, pidx) => {
    const list = clone(titres);
    list[tidx].sousTitres[sidx].pieces.splice(pidx, 1);
    setTitres(list);
  };

  const startEditingPiece = (tIdx, sIdx, pIdx, currentValue) => {
    setEditingPiece({ tIdx, sIdx, pIdx });
    setEditValue(currentValue);
  };

  const saveEditedPiece = () => {
    if (!editingPiece) return;
    const { tIdx, sIdx, pIdx } = editingPiece;
    if (!editValue.trim()) {
      setEditingPiece(null);
      return;
    }
    const list = clone(titres);
    list[tIdx].sousTitres[sIdx].pieces[pIdx] = editValue.trim();
    setTitres(list);
    setEditingPiece(null);
  };

  const cancelEditingPiece = () => {
    setEditingPiece(null);
    setEditValue("");
  };

  const handlePieceInputChange = (tidx, sidx, value) => {
    const list = clone(titres);
    list[tidx].sousTitres[sidx].pieceInput = value;
    setTitres(list);
  };

  const handlePieceInputKeyDown = (e, tidx, sidx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPiece(tidx, sidx);
    }
  };

  // ===========================
  // 🔹 RENDU SOUS-TITRE / PIÈCES
  // ===========================
  const renderSousTitreAndPieces = (t, tIdx, sIdx, st, color) => {
    const piecesList = st.pieces || [];

    return (
      <Box
        key={st.id}
        sx={{
          p: 2,
          mt: 2,
          background: color,
          borderRadius: 1,
          border: "1px dashed #ccc",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <List size={20} color="gray" />
          <TextField
            fullWidth
            size="small"
            label={`Sous-titre ${sIdx + 1}`}
            value={st.sousTitre || ""}
            onChange={(e) => changeSousTitre(tIdx, sIdx, e.target.value)}
          />
          <Tooltip title="Supprimer ce sous-titre">
            <IconButton color="error" onClick={() => removeSousTitre(tIdx, sIdx)}>
              <Trash size={20} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} mt={2}>
          <TextField
            fullWidth
            size="small"
            label="Nouvelle pièce justificative"
            placeholder="Nom de la pièce + Entrée"
            value={st.pieceInput || ""}
            onChange={(e) => handlePieceInputChange(tIdx, sIdx, e.target.value)}
            onBlur={() => addPiece(tIdx, sIdx)}
            onKeyDown={(e) => handlePieceInputKeyDown(e, tIdx, sIdx)}
          />
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => addPiece(tIdx, sIdx)}
            sx={{ minWidth: 100 }}
          >
            Ajouter
          </Button>
        </Stack>

        {piecesList.length > 0 && (
          <Box
            mt={2}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              p: 1.5,
              border: "1px solid #ddd",
              borderRadius: 1,
              bgcolor: "white",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", width: "100%", mb: 0.5 }}>
              Pièces (Cliquez sur une pièce pour la modifier) :
            </Typography>

            {piecesList.map((p, pIdx) => {
              const isEditing =
                editingPiece?.tIdx === tIdx &&
                editingPiece?.sIdx === sIdx &&
                editingPiece?.pIdx === pIdx;

              if (isEditing) {
                return (
                  <TextField
                    key={pIdx}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEditedPiece}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditedPiece();
                      if (e.key === "Escape") cancelEditingPiece();
                    }}
                    autoFocus
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={saveEditedPiece} color="primary">
                            <Check size={16} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                );
              }

              return (
                <Tooltip key={pIdx} title="Cliquer pour modifier" arrow>
                  <Chip
                    label={p}
                    variant="outlined"
                    onClick={() => startEditingPiece(tIdx, sIdx, pIdx, p)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      removePiece(tIdx, sIdx, pIdx);
                    }}
                    deleteIcon={<X size={16} />}
                    icon={<Pencil size={12} style={{ opacity: 0.5 }} />}
                    sx={{
                      fontWeight: "medium",
                      cursor: "text",
                      "&:hover": { bgcolor: "#f5f5f5", borderColor: "primary.main" },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  // ===========================
  // 🔹 RENDU TITRE
  // ===========================
  const renderTitre = (t, tIdx) => {
    const sousTitresSafe = t.sousTitres || [];

    return (
      <Paper key={t.id} sx={{ p: 3, background: "#EAF6FF", boxShadow: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <BookOpen size={24} color="#333" />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Titre {tIdx + 1}
            </Typography>
          </Stack>
          <Tooltip title="Supprimer ce Titre">
            <Button
              color="error"
              startIcon={<Trash />}
              size="small"
              onClick={() => removeTitre(tIdx)}
              variant="outlined"
            >
              Supprimer
            </Button>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={2} mt={2} alignItems="center">
          <TextField
            fullWidth
            label="Intitulé du Titre"
            size="small"
            value={t.titre || ""}
            onChange={(e) => changeTitre(tIdx, e.target.value)}
          />
          {type === "solde" && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={t.pieceType || "visa"}
                label="Type"
                onChange={(e) => changeTypePiece(tIdx, e.target.value)}
              >
                <MenuItem value="visa">Visa</MenuItem>
                <MenuItem value="mandatement">Mandatement</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{ mt: 3, mb: 1, fontWeight: "bold", borderBottom: "1px solid #ddd", pb: 0.5 }}
        >
          Détails / Sous-Titres
        </Typography>

        {sousTitresSafe.map((st, sIdx) =>
          renderSousTitreAndPieces(t, tIdx, sIdx, st, "#F8FBFF")
        )}

        <Button
          startIcon={<Plus />}
          sx={{ mt: 2 }}
          onClick={() => addSousTitre(tIdx)}
          variant="text"
          size="small"
        >
          Ajouter un Sous-Titre
        </Button>
      </Paper>
    );
  };

  return (
    <Stack spacing={4}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ borderBottom: "2px solid #3f51b5", pb: 1 }}
      >
        Gestion des Pièces Justificatives
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Organisez les pièces justificatives par Titre (catégorie principale) et
        Sous-Titre (détail).
      </Typography>

      {(titres || []).map((t, tIdx) => renderTitre(t, tIdx))}

      <Button
        variant="contained"
        startIcon={<Plus />}
        onClick={addTitre}
        sx={{ mt: 2 }}
      >
        Ajouter un nouveau Titre
      </Button>
    </Stack>
  );
}
