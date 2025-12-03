import React, { useState, useMemo } from "react";
import {
  Stack,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Tooltip,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import { ListChecks, Tag, Lightbulb, FileText, Check, X, Trash2, Edit } from "lucide-react";

// ---------------------
//  UTILITAIRES
// ---------------------
const normalizeReferences = (refs) => {
  if (!Array.isArray(refs)) return [];
  return refs
    .map((r) => {
      if (typeof r === "string") return r.trim();
      if (typeof r === "object" && r?.text_article) return r.text_article.trim();
      return "";
    })
    .filter(Boolean);
};

const truncateText = (text, max = 60) =>
  text.length > max ? text.slice(0, max).trim() + "..." : text;

// ---------------------
//  COMPOSANT PRINCIPAL
// ---------------------
export default function Step1Info({
  type,
  setType,
  nature,
  setNature,
  reference,
  setReference,
  references = [],
}) {
  const theme = useTheme();

  // Toujours garantir un array
  const safeReference = Array.isArray(reference) ? reference : [];

  const initialOptions = useMemo(() => normalizeReferences(references), [references]);
  const [options, setOptions] = useState(initialOptions);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [natureError, setNatureError] = useState("");

  const documentTypeDisplay =
    type === "solde" ? "Solde" : type === "pension" ? "Pension" : "Inconnu";

  // ---------------------
  //  NATURE
  // ---------------------
  const handleNatureChange = (e) => {
    const v = e.target.value;
    setNature(v);
    setNatureError(v.trim() ? "" : "La nature du document est obligatoire.");
  };

  // ---------------------
  //  REFERENCES
  // ---------------------
  const handleReferenceChange = (_, newValue) => {
    if (editingIndex !== null) cancelEdit();

    const cleaned = newValue
      .map((v) => (typeof v === "string" ? v.trim() : v))
      .filter(Boolean);

    setReference([...cleaned]); // garantit array

    const newOnes = cleaned.filter((r) => !options.includes(r));
    if (newOnes.length) setOptions((prev) => [...prev, ...newOnes]);
  };

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditingValue(text);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const confirmEdit = () => {
    if (!editingValue.trim()) {
      cancelEdit();
      return;
    }

    const updated = [...safeReference];
    updated[editingIndex] = editingValue.trim();
    setReference(updated);

    if (!options.includes(editingValue.trim())) {
      setOptions((prev) => [...prev, editingValue.trim()]);
    }

    cancelEdit();
  };

  const deleteReference = (index) => {
    const updated = safeReference.filter((_, i) => i !== index);
    setReference(updated);
    if (editingIndex === index) cancelEdit();
  };

  const handleKeyDownEdit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmEdit();
    }
  };

  // ---------------------
  //  Tooltip Élégant
  // ---------------------
  const CustomTooltip = ({ title, children, index }) => (
    <Tooltip
      arrow
      placement="top"
      title={
        <Stack spacing={1} sx={{ maxWidth: 350 }}>
          <Typography variant="body2" fontWeight="bold">
            Référence complète :
          </Typography>
          <Typography variant="body2">{title}</Typography>

          <Box sx={{ textAlign: "right", mt: 1 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Trash2 size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                deleteReference(index);
              }}
            >
              Supprimer
            </Button>
          </Box>
        </Stack>
      }
    >
      {children}
    </Tooltip>
  );

  // ---------------------
  //  CHIP sobre
  // ---------------------
  const CustomChip = ({ option, index, getTagProps }) => {
    const isEditing = editingIndex === index;

    return (
      <CustomTooltip title={option} index={index}>
        <Chip
          {...getTagProps({ index })}
          icon={<Tag size={15} />}
          label={truncateText(option)}
          variant="outlined"
          sx={{
            maxWidth: 280,
            minWidth: 150,
            borderColor: isEditing ? theme.palette.primary.main : theme.palette.grey[400],
            backgroundColor: isEditing ? theme.palette.grey[100] : "transparent",
            cursor: "pointer",
          }}
          onClick={() => startEditing(index, option)}
        />
      </CustomTooltip>
    );
  };

  // ---------------------
  //  RENDER
  // ---------------------
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Card variant="outlined">
        <CardHeader
          title="Informations du Document"
          subheader="Veuillez remplir les champs suivants."
          avatar={<ListChecks />}
          sx={{ borderBottom: "1px solid", borderColor: theme.palette.divider }}
        />

        <CardContent>
          <Stack spacing={3}>
            {/* NATURE */}
            <TextField
              fullWidth
              label="Nature du Document *"
              value={nature || ""}
              onChange={handleNatureChange}
              helperText={natureError || "Ex : Départ à la retraite, disponibilité…"}
              error={!!natureError}
              minRows={2}
            />

            {/* REFERENCES */}
            <Autocomplete
              multiple
              freeSolo
              options={options}
              value={safeReference}
              onChange={handleReferenceChange}
              fullWidth
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <CustomChip
                    key={index}
                    option={option}
                    index={index}
                    getTagProps={getTagProps}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Références juridiques" />
              )}
            />

            {/* EDITION */}
            {editingIndex !== null && (
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.grey[50],
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Modifier la référence
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={handleKeyDownEdit}
                  sx={{ mb: 2 }}
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" startIcon={<X />} onClick={cancelEdit}>
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Check />}
                    onClick={confirmEdit}
                    disabled={!editingValue.trim()}
                  >
                    Confirmer
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* NOTE SOBRE */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: theme.palette.grey[100],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1}>
                <Lightbulb size={16} />
                <Typography variant="body2">
                  Survolez un tag pour voir le texte complet ou le supprimer.  
                  Cliquez dessus pour l’éditer.
                </Typography>
              </Stack>
            </Box>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
