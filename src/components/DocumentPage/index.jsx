import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";

import Step1Info from "./Step1Info";
import Step2Titres from "./Step2Titres";
import Step3Recap from "./Step3Recap";

import { addDocument } from "../../services/solde";
import { showToast, showError, showAlert } from "../../utils/alerts";

export default function DocumentPage({
  initialType = "solde",
  references = [],
  onCancel,
  onSubmit,
  updateDoc = null, // ⬅️ Document en mode modification
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [nature, setNature] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [reference, setReference] = useState("");
  const [titres, setTitres] = useState([
    { titre: "", sousTitres: [{ sousTitre: "", pieces: [], pieceInput: "" }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [refsList, setRefsList] = useState(references);
  const [type, setType] = useState(initialType);

  const steps = ["Informations générales", "Titres et pièces", "Récapitulatif"];

  // ---------------------------------------------------------
  // 🚀 Charger automatiquement les données lors d'une modification
  // ---------------------------------------------------------
  useEffect(() => {
    if (updateDoc) {
      setNature(updateDoc.nature || "");
      setPieceType(updateDoc.pieceType || "");
      setReference(updateDoc.reference || "");
      setTitres(
        updateDoc.titres?.length
          ? updateDoc.titres
          : [{ titre: "", sousTitres: [{ sousTitre: "", pieces: [] }] }]
      );
      setType(updateDoc.type || initialType);

      if (updateDoc.reference) {
        setRefsList([...references, updateDoc.reference]);
      }
    }
  }, [updateDoc]);

  // ---------------------------------------------------------
  //  Navigation entre les étapes + validation
  // ---------------------------------------------------------
  const handleNext = () => {
    if (activeStep === 0) {
      if (!nature.trim()) return showAlert("Erreur", "La nature est obligatoire.", "error");
      if (type === "solde" && !pieceType)
        return showAlert("Erreur", "Le type de pièce est obligatoire.", "error");
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  // ---------------------------------------------------------
  //  Validation finale (Création ou Mise à jour)
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = {
        id: updateDoc?.id || null, // ⬅️ On transmet l’ID en mode édition
        type,
        nature,
        pieceType: type === "solde" ? pieceType : null,
        reference,
        titres: titres.map((t) => ({
          titre: t.titre,
          sousTitres: t.sousTitres.map((s) => ({
            sousTitre: s.sousTitre,
            pieces: s.pieces,
          })),
        })),
      };

      // 🔧 Mode ÉDITION → on transmet au parent et on attend la fin
      if (updateDoc) {
        await onSubmit?.(data, "update");
        showToast("Document modifié avec succès ✏️");
        return;
      }

      // 🆕 Mode CRÉATION
      // on attend l'insert et on transmet l'ID créé au parent
      const newId = await addDocument({ data });
      showToast("Document enregistré avec succès 🎉");
      await onSubmit?.({ ...data, id: newId }, "create");

    } catch (err) {
      showError("Impossible d’enregistrer le document.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  //  UI
  // ---------------------------------------------------------
  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: "40vh" }}>
        {activeStep === 0 && (
          <Step1Info
            nature={nature}
            setNature={setNature}
            pieceType={pieceType}
            setPieceType={setPieceType}
            reference={reference}
            setReference={setReference}
            references={refsList}
            setReferences={setRefsList}
            type={type}
            setType={setType}
          />
        )}

        {activeStep === 1 && (
          <Step2Titres titres={titres} setTitres={setTitres} />
        )}

        {activeStep === 2 && (
          <Step3Recap
            nature={nature}
            pieceType={pieceType}
            reference={reference}
            referencesList={refsList}
            titres={titres}
          />
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" color="error" onClick={onCancel}>
          Annuler
        </Button>

        {activeStep > 0 && (
          <Button variant="outlined" onClick={handleBack}>
            Précédent
          </Button>
        )}

        {activeStep < steps.length - 1 && (
          <Button variant="contained" onClick={handleNext}>
            Suivant
          </Button>
        )}

        {activeStep === steps.length - 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Enregistrement...
              </>
            ) : updateDoc ? (
              "Modifier"
            ) : (
              "Valider et enregistrer"
            )}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
