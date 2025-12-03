// components/FloatingMenuButton.jsx
import React, { useState } from "react";
import { Box, Fab, Paper, Stack, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function FloatingMenuButton({ actions = [] }) {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        // Le conteneur parent reste le point d'ancrage
      }}
      // On conserve le hover pour un effet rapide si désiré
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Stack
        direction="column"
        alignItems="flex-end" // Assure que le menu et le bouton sont alignés à droite
      >
        {/* Le menu est affiché au-dessus */}
        {open && (
          <Paper
            elevation={4}
            sx={{
              mb: 1,
              p: 1,
              borderRadius: 2,
              width: 220,
              // Amélioration UX: animation pour l'apparition
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            <Stack spacing={1}>
              {actions.map((a, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    p: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    // Amélioration UX: transition pour l'effet de survol
                    transition: "background-color 0.15s",
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                  onClick={() => {
                    a.onClick();
                    setOpen(false); // Ferme le menu après un clic sur une action
                  }}
                >
                  <IconButton size="small" color="primary">
                    {a.icon}
                  </IconButton>
                  <Typography variant="body2">{a.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Le bouton Fab est maintenant géré par la Stack et reste aligné à droite */}
        <Fab
          color="primary"
          onClick={toggleMenu}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          sx={{
            // Amélioration UX: Rotation de l'icône pour un effet "fermer"
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <AddIcon />
        </Fab>
      </Stack>
    </Box>
  );
}