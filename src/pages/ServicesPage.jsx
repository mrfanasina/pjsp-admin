import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getServices,
  addService,
  updateService,
  deleteService,
} from "../services/solde.js";
import { showConfirm, showToast, showToastErr } from "../utils/alerts.js";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const nameRef = useRef();

  // -----------------------------
  // Fetch services
  // -----------------------------
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await getServices();
      setServices(res);
    } catch (err) {
      console.error("Erreur getServices:", err);
      showToastErr?.("Impossible de charger les services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setSelectedService(null);
    setName("");
    setTelephone("");
    setErrors({});
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (svc) => {
    setSelectedService(svc);
    setName(svc.name || "");
    setTelephone(svc.telephone || "");
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

  // -----------------------------
  // Validations
  // -----------------------------
  const validate = () => {
    const err = {};

    // Nom
    if (!name.trim()) err.name = "Le nom est requis";
    else if (name.trim().length < 2) err.name = "Min. 2 caractères";
    else if (name.trim().length > 50) err.name = "Max. 50 caractères";

    // Doublon
    const normalized = name.trim().toLowerCase();
    const duplicate = services.find(
      (s) =>
        s.name.trim().toLowerCase() === normalized &&
        s.id !== selectedService?.id
    );
    if (duplicate) err.name = "Un service avec ce nom existe déjà";

    // Téléphone (optionnel)
    if (telephone.trim()) {
      const phoneRegex = /^[+0-9 ]{6,25}$/; // autorise espaces
      if (!phoneRegex.test(telephone.trim()))
        err.telephone = "Numéro invalide (chiffres, + et espaces uniquement)";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // -----------------------------
  // Format telephone
  // -----------------------------
  const formatPhone = (value) => {
    let clean = value.replace(/\D/g, ""); // supprimer tout sauf chiffres
    if (value.startsWith("+")) {
      clean = "+" + clean;
    }

    // Pour numéro local (ex: 0324055508 -> 032 40 555 08)
    if (!clean.startsWith("+")) {
      if (clean.length <= 3) return clean;
      if (clean.length <= 5) return clean.replace(/(\d{3})(\d+)/, "$1 $2");
      if (clean.length <= 8)
        return clean.replace(/(\d{3})(\d{2})(\d+)/, "$1 $2 $3");
      return clean.replace(/(\d{3})(\d{2})(\d{3})(\d+)/, "$1 $2 $3 $4");
    }

    // Pour numéro international (ex: +261324055508 -> +261 32 40 555 08)
    if (clean.startsWith("+")) {
      const country = clean.slice(0, 4); // +261
      const rest = clean.slice(4);
      if (rest.length <= 2) return country + " " + rest;
      if (rest.length <= 4) return rest.replace(/(\d{2})(\d+)/, "$1 $2");
      if (rest.length <= 7) return rest.replace(/(\d{2})(\d{2})(\d+)/, "$1 $2 $3");
      return country + " " + rest.replace(/(\d{2})(\d{2})(\d{3})(\d+)/, "$1 $2 $3 $4");
    }

    return clean;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setTelephone(formatted);
    if (errors.telephone) validate();
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const trimmedName = name.trim();
      const trimmedPhone = telephone.trim();

      if (selectedService) {
        await updateService(selectedService.id, {
          name: trimmedName,
          telephone: trimmedPhone,
        });
        setServices((prev) =>
          prev.map((s) =>
            s.id === selectedService.id
              ? { ...s, name: trimmedName, telephone: trimmedPhone }
              : s
          )
        );
        showToast("Service modifié avec succès");
      } else {
        const newId = await addService({
          name: trimmedName,
          telephone: trimmedPhone,
        });
        setServices((prev) => [
          { id: newId, name: trimmedName, telephone: trimmedPhone },
          ...prev,
        ]);
        showToast("Service ajouté avec succès");
      }

      handleCancel();
    } catch (err) {
      console.error("Erreur create/update service:", err);
      showToastErr("Erreur lors de l'enregistrement du service");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (serviceId) => {
    try {
      const conf = await showConfirm(
        "Confirmer la suppression ?",
        "warning",
        "Oui, supprimer",
        "Cette action est irréversible."
      );
      if (!conf) return;

      setDeletingId(serviceId);
      await deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      showToast("Service supprimé");
    } catch (err) {
      console.error("Erreur deleteService:", err);
      showToastErr("Impossible de supprimer le service");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Gestion des services</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleAddClick}
        >
          Ajouter un service
        </Button>
      </Stack>

      {showForm && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
          >
            <TextField
              label="Nom du service"
              value={name}
              inputRef={nameRef}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) validate();
              }}
              error={!!errors.name}
              helperText={errors.name}
              FormHelperTextProps={{ sx: { mb: 1 } }}
              fullWidth
            />

            <TextField
              label="Téléphone"
              value={telephone}
              onChange={handlePhoneChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9+]/g, "");
              }}
              error={!!errors.telephone}
              helperText={errors.telephone}
              FormHelperTextProps={{ sx: { mb: 1 } }}
              sx={{ width: 420 }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={saving}
              >
                Annuler
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                {selectedService ? "Modifier" : "Ajouter"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Stack spacing={2}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : services.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            <Typography>Aucun service enregistré.</Typography>
          </Paper>
        ) : (
          services.map((svc) => (
            <Card key={svc.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{svc.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {svc.telephone ? formatPhone(svc.telephone) : ""}
              </Typography>
            </CardContent>


              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  color="primary"
                  onClick={() => handleEdit(svc)}
                >
                  Modifier
                </Button>

                <Button
                  startIcon={
                    deletingId === svc.id ? (
                      <CircularProgress size={18} />
                    ) : (
                      <DeleteIcon />
                    )
                  }
                  size="small"
                  color="error"
                  onClick={() => handleDelete(svc.id)}
                  disabled={deletingId === svc.id}
                >
                  {deletingId === svc.id ? "Suppression..." : "Supprimer"}
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}
