import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

export default function ParametresPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Paramètres du compte
      </Typography>

      <TextField
        label="Nom"
        fullWidth
        sx={{ mb: 2 }}
        defaultValue="Utilisateur Exemple"
      />
      <TextField
        label="Email"
        fullWidth
        sx={{ mb: 2 }}
        defaultValue="exemple@email.com"
      />

      <Button variant="contained" color="primary">
        Enregistrer les modifications
      </Button>
    </Box>
  );
}
