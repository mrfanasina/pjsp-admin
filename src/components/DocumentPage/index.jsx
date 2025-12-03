import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  CircularProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import Step1Info from "./Step1Info";
import Step2Titres from "./Step2Titres";
import Step3Recap from "./Step3Recap";

import { addDocument } from "../../services/solde";
import { showToast, showError } from "../../utils/alerts";

export default function DocumentPage({
  initialType = "solde",
  references = [],
  onCancel,
  onSubmit,
  updateDoc = null,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [nature, setNature] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [reference, setReference] = useState([]);
  const [titres, setTitres] = useState([
    { titre: "", pieceType: "", sousTitres: [{ sousTitre: "", pieces: [], pieceInput: "" }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [refsList, setRefsList] = useState(references);
  const [type, setType] = useState(initialType);

  const steps = ["Informations générales", "Titres et pièces", "Récapitulatif"];

  // ---------------------------------------------------------
  // 🚀 Chargement initial (omis pour la concision)
  // ---------------------------------------------------------
  useEffect(() => {
    // ... (Logique de chargement initiale conservée)
    if (updateDoc) {
      setNature(updateDoc.nature || "");
      setPieceType(updateDoc.pieceType || "");
      setReference(
        Array.isArray(updateDoc.reference)
          ? updateDoc.reference
          : updateDoc.reference
          ? [updateDoc.reference]
          : []
      );
      setTitres(
        updateDoc.titres?.length
          ? updateDoc.titres
          : [{ titre: "", sousTitres: [{ sousTitre: "", pieces: [] }] }]
      );
      setType(updateDoc.type || initialType);

      if (updateDoc.reference) {
        setRefsList([
          ...references,
          ...(Array.isArray(updateDoc.reference)
            ? updateDoc.reference
            : [updateDoc.reference]),
        ]);
      }
    }
  }, [updateDoc, references, initialType]);


  // ---------------------------------------------------------
  //  Navigation entre les étapes + validation
  // ---------------------------------------------------------
  const handleStepChange = (stepIndex) => {
    // Si on avance (Suivant ou Pager) et qu'on quitte l'étape 0
    const isMovingForwardFromStep0 = stepIndex > activeStep && activeStep === 0;
    
    // Validation: Obligatoire si on quitte l'étape 1 vers une étape > 0
    if (isMovingForwardFromStep0 && !nature.trim()) {
        showToast("La nature du document est requise pour passer à l'étape suivante.", "error");
        return;
    }

    setActiveStep(stepIndex);
  };
  
  // Raccourcis pour les boutons Suivant/Précédent
  const handleNext = () => handleStepChange(activeStep + 1);
  const handleBack = () => handleStepChange(activeStep - 1);


  // ---------------------------------------------------------
  //  Validation finale (Création ou Mise à jour)
  // ---------------------------------------------------------
  const hasAllPieceTypes =
    type === "solde"
      ? titres.every((t) => !!t.pieceType)
      : true;
  const typePieceMapping = {
    visa: "Pièces requises pour visa",
    mandatement: "Pièces Mandatement",
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = {
        type,
        nature,
        reference:
          reference && Array.isArray(reference)
            ? reference
            : reference
            ? [reference]
            : [],
        titres: titres.map((t) => ({
          titre: t.titre,
          pieceType: type === "solde" ? t.pieceType : null,
          sousTitres: t.sousTitres.map((s) => ({
            sousTitre: s.sousTitre,
            pieces: s.pieces,
          })),
        })),
      };

      if (updateDoc) {
        console.log("Mise à jour du document avec les données :", data);
        await onSubmit?.({ ...data, id: updateDoc.id }, "update");
        showToast("Document modifié avec succès ");
        return;
      }

      const newId = await addDocument({ data });
      showToast("Document enregistré avec succès ");
      await onSubmit?.({ ...data, id: newId }, "create");

    } catch (err) {
      console.log(err);
      
      showError("Impossible d’enregistrer le document.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  //  UI
  // ---------------------------------------------------------
  const submitButtonText = updateDoc ? "Modifier le document" : "Valider et enregistrer";
  
  const isNatureEmpty = !nature.trim();
  const isLastStep = activeStep === steps.length - 1;
  
  // Le bouton Suivant/Valider est désactivé si:
  const isActionDisabled = 
    loading || 
    (activeStep === 0 && isNatureEmpty) || 
    (isLastStep && !hasAllPieceTypes);

  // Texte de guidage conditionnel
  const guidanceText = [
    "Renseignez la nature du document avant de continuer.",
    "Ajoutez et organisez les titres et les pièces justificatives.",
    "Vérifiez l'ensemble des informations avant la validation finale.",
  ][activeStep];
  
  // Style de bouton du Pager
  const getPagerButtonProps = (index) => ({
      variant: index === activeStep ? 'contained' : 'outlined',
      color: index === activeStep ? 'primary' : 'default',
      size: 'small',
      onClick: () => handleStepChange(index),
      disabled: (index > activeStep && activeStep === 0 && isNatureEmpty), 
  });


  return (
    <Box>
      {/* B. Contenu des étapes */}
      <Box sx={{ height: "100vh", overflowY: "auto", pb: '100px' }}>

        {activeStep === 0 && (
          <Step1Info
            nature={nature}
            setNature={setNature}
            reference={reference}
            setReference={setReference}
            references={refsList}
            setReferences={setRefsList}
            type={type}
            setType={setType}
          />
        )}

        {activeStep === 1 && (
          <Step2Titres
            titres={titres}
            setTitres={setTitres}
            type={type}
          />
        )}

        {activeStep === 2 && (
          <Step3Recap
            nature={nature}
            pieceType={pieceType}
            reference={reference}
            referencesList={refsList}
            titres={titres}
            type={type}
          />
        )}
      </Box>

      {/* C. Barre de navigation FIXE (Footer) */}
      <Box
        sx={{
          // !! POSITION FIXE CORRECTE !!
          position: "fixed", 
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #ddd',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
      >
        {/* Contenu principal de la barre */}
        <Stack spacing={1} sx={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Conteneur de la navigation (Alignement des 3 blocs) */}
            <Box
                component={Stack}
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: '100%', position: 'relative' }} // Permet le centrage absolu du Pager
            >
            
                {/* 1. Bloc GAUCHE: Annuler / Précédent */}
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="error" onClick={onCancel}>
                        Annuler
                    </Button>
                    
                    {/* Bouton Précédent: Toujours là, désactivé si activeStep = 0 */}
                    <Button 
                        variant="outlined" 
                        onClick={handleBack} 
                        startIcon={<ArrowLeft />}
                        disabled={activeStep === 0}
                    >
                        Précédent
                    </Button>
                </Stack>
    
                {/* 2. Bloc CENTRAL: PAGER (Centré Absolument) */}
                <Stack 
                    direction="row" 
                    spacing={1}
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10, 
                    }}
                >
                    {steps.map((label, index) => (
                        <Tooltip title={label} key={index}>
                            <Button
                                {...getPagerButtonProps(index)}
                                sx={{ 
                                    minWidth: 40,
                                    ...(index < activeStep ? { bgcolor: '#e0e0e0', color: 'black' } : {}),
                                    transition: 'all 0.3s',
                                }}
                            >
                                {index + 1}
                            </Button>
                        </Tooltip>
                    ))}
                </Stack>
    
                {/* 3. Bloc DROIT: Suivant / Valider */}
                <Stack direction="row" spacing={2}>
                    {/* Si ce n'est PAS la dernière étape, afficher Suivant */}
                    {!isLastStep && (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={isActionDisabled}
                            endIcon={<ArrowRight />}
                        >
                            Suivant
                        </Button>
                    )}
    
                    {/* Si c'est la dernière étape, afficher Valider */}
                    {isLastStep && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Check />}
                        >
                            {submitButtonText}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Stack>
      </Box>
    </Box>
  );
}