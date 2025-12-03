import React from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Divider,
} from "@mui/material";

export default function Step3Recap({
  type,
  nature,
  pieceType,
  reference,
  titres = [],
  onBack,
  onConfirm,
  loading = false,
}) {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={600}>
        Récapitulatif
      </Typography>

      {/* === Informations principales === */}
      <Paper variant="outlined" sx={{ p: 2, backgroundColor: "grey.50" }}>
        <Stack spacing={1}>
          <Typography>
            <strong>Type de document :</strong> {type || "-"}
          </Typography>
          <Typography>
            <strong>Nature :</strong> {nature || "-"}
          </Typography>
          {/* Affiche le type de pièces global seulement pour solde */}
          {type === "solde" && (
            <Typography>
              <strong>Type de pièces :</strong> {pieceType || "-"}
            </Typography>
          )}
          <Typography>
            <strong>Référence :</strong> {reference || "-"}
          </Typography>
        </Stack>
      </Paper>

      <Divider />

      {/* === Titres / sous-titres / pièces === */}
      <Stack spacing={2}>
        {titres.length === 0 ? (
          <Typography color="text.secondary">
            Aucun titre ajouté.
          </Typography>
        ) : (
          titres.map((titreBloc, tIdx) => (
            <Paper key={tIdx} variant="outlined" sx={{ p: 2 }}>
              {/* === Titre === */}
              {titreBloc.titre && (
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  {`Titre ${tIdx + 1}: ${titreBloc.titre}`}
                </Typography>
              )}

              {/* Affiche le type de pièce pour chaque titre si solde */}
              {type === "solde" && (
                <Typography variant="body2" color="text.secondary" mb={1}>
                  <strong>Type de pièces :</strong> {titreBloc.pieceType || "-"}
                </Typography>
              )}

              {/* === Sous-titres === */}
              {titreBloc.sousTitres?.map((sous, sIdx) => (
                <Box key={sIdx} sx={{ pl: 2, mb: 1 }}>
                  {sous.sousTitre && (
                    <Typography variant="body1" fontWeight={500}>
                      {`Sous-titre ${sIdx + 1}: ${sous.sousTitre}`}
                    </Typography>
                  )}

                  {/* === Pièces === */}
                  {sous.pieces?.length > 0 ? (
                    <Stack
                      component="ul"
                      spacing={0.5}
                      sx={{ pl: 3, m: 0 }}
                    >
                      {sous.pieces.map((p, pIdx) => (
                        <Typography
                          component="li"
                          key={pIdx}
                          variant="body2"
                          sx={{ listStyleType: "disc" }}
                        >
                          {p}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ pl: 3 }}
                    >
                      — Aucune pièce
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>
          ))
        )}
      </Stack>

      {/* === Actions (facultatif) === */}
      {(onBack || onConfirm) && (
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          {onBack && (
            <Button variant="outlined" onClick={onBack}>
              Retour
            </Button>
          )}
          {onConfirm && (
            <Button
              variant="contained"
              color="primary"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Confirmer et enregistrer"}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
