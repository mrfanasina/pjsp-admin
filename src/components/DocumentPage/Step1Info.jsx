import React from "react";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";

export default function Step1Info({
  type,
  setType,
  nature,
  setNature,
  pieceType,
  setPieceType,
  reference,
  setReference,
  references = [],
}) {
  // On convertit correctement la liste des références en tableau de chaînes
  const refOptions = references.map((r) =>
    typeof r === "string" ? r : r.label || ""
  );

  return (
    <Stack spacing={3}>
      {/* === Type de document === */}
      <FormControl fullWidth size="small">
        <InputLabel>Type de document</InputLabel>
        <Select
          value={type || ""}
          label="Type de document"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value="solde">Solde</MenuItem>
          <MenuItem value="pension">Pension</MenuItem>
        </Select>
      </FormControl>

      {/* === Nature === */}
      <TextField
        fullWidth
        label="Nature *"
        value={nature || ""}
        onChange={(e) => setNature(e.target.value)}
        size="small"
      />

      {/* === Type de pièces === */}
      {type === "solde" && (
        <FormControl fullWidth size="small">
          <InputLabel>Type de pièces *</InputLabel>
          <Select
            value={pieceType || ""}
            label="Type de pièces *"
            onChange={(e) => setPieceType(e.target.value)}
          >
            <MenuItem value="">-- Choisir --</MenuItem>
            <MenuItem value="Pièces requises pour visa">
              Pièces requises pour visa
            </MenuItem>
            <MenuItem value="Pièces Mandatement">Pièces Mandatement</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* === Référence === */}
      <Autocomplete
        freeSolo
        options={refOptions}
        value={reference || ""}
        onChange={(event, newValue) => {
          // Sélection depuis la liste
          if (typeof newValue === "string") {
            setReference(newValue);
          } else {
            setReference(newValue || "");
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Référence"
            size="small"
            placeholder="Saisir ou sélectionner une référence..."
            value={reference || ""}
            onChange={(e) => setReference(e.target.value)} // saisie manuelle
          />
        )}
      />
    </Stack>
  );
}
