import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  List,
  ListItem,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DocumentFormModal({
  open,
  onClose,
  type = "solde",
  onSubmit,
  references = [],
}) {
  const [nature, setNature] = useState("");
  const [sousTitre, setSousTitre] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [reference, setReference] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [pieceInput, setPieceInput] = useState("");

  const handleAddPiece = () => {
    if (!pieceInput.trim()) return;
    setPieces((prev) => [...prev, pieceInput.trim()]);
    setPieceInput("");
  };

  const handleRemovePiece = (index) => {
    setPieces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!nature.trim()) {
      alert("La nature du document est obligatoire");
      return;
    }

    const data = {
      type,
      nature,
      sousTitre,
      pieceType: type === "solde" ? pieceType : null,
      reference,
      pieces, 
    };

    onSubmit(data);
    handleReset();
  };

  const handleReset = () => {
    setNature("");
    setSousTitre("");
    setPieceType("");
    setReference(null);
    setPieces([]);
    setPieceInput("");
  };

  const modalTitle =
    type === "solde"
      ? "Nouveau document de solde"
      : "Nouveau document de pension";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{modalTitle}</DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {type === "solde" && (
            <FormControl fullWidth>
              <InputLabel id="piece-type-label">
                Type de pièces justificatives
              </InputLabel>
              <Select
                labelId="piece-type-label"
                value={pieceType}
                label="Type de pièces justificatives"
                onChange={(e) => setPieceType(e.target.value)}
              >
                <MenuItem value="visa">Pièces requises pour visa</MenuItem>
                <MenuItem value="mandatement">Pièces pour mandatement</MenuItem>
              </Select>
            </FormControl>
          )}

          <Autocomplete
            freeSolo
            options={["Attestation de solde tout compte", "Décision de pension"]}
            value={nature}
            onInputChange={(_, val) => setNature(val)}
            renderInput={(params) => (
              <TextField {...params} label="Nature du document *" required />
            )}
          />

          <TextField
            label="Sous-titre"
            value={sousTitre}
            onChange={(e) => setSousTitre(e.target.value)}
            fullWidth
          />

          {/* Pièces dynamiques */}
          <Box display="flex" gap={1}>
            <TextField
              label="Ajouter une pièce"
              value={pieceInput}
              onChange={(e) => setPieceInput(e.target.value)}
              fullWidth
            />
            <Button variant="outlined" onClick={handleAddPiece}>
              Ajouter
            </Button>
          </Box>

          {pieces.length > 0 && (
            <List dense>
              {pieces.map((p, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemovePiece(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Typography>{p}</Typography>
                </ListItem>
              ))}
            </List>
          )}

          <FormControl fullWidth>
            <InputLabel id="ref-label">Référence liée</InputLabel>
            <Select
              labelId="ref-label"
              value={reference || ""}
              label="Référence liée"
              onChange={(e) => setReference(e.target.value)}
            >
              {references.map((ref) => (
                <MenuItem key={ref.id} value={ref.id}>
                  {ref.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
