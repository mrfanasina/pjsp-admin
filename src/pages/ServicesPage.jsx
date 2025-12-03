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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import PhoneIcon from "@mui/icons-material/Phone";

import FloatingMenuButton from "../components/FloatingMenuButton";

import {
    getServices,
    addService,
    updateService,
    deleteService,
    getServiceTypes,
    addServiceType,
    updateServiceType,
    deleteServiceType,
} from "../services/solde.js";

import { showConfirm, showToast, showToastErr } from "../utils/alerts.js";
import { useSearch } from "../contexts/SearchContext";

// --- Composant Auxiliaire : Modale de Gestion des Types (Pour l'Édition) ---
const TypeManagementDialog = ({
    open,
    onClose,
    type, 
    onUpdate, 
}) => {
    const [label, setLabel] = useState(type?.label || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLabel(type?.label || "");
    }, [type]);

    if (!type) return null;

    const handleUpdate = async () => {
        const newLabel = label.trim();
        if (!newLabel || newLabel === type.label) return;

        try {
            setSaving(true);
            await updateServiceType(type.id, { label: newLabel });
            onUpdate(type.id, newLabel);
            showToast("Type modifié avec succès");
            onClose();
        } catch {
            showToastErr("Erreur de modification du type");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Modifier le Type : **{type.label}**</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Nom du Type"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    fullWidth
                    disabled={saving}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error" variant="outlined">
                    Annuler
                </Button>
                <Button
                    onClick={handleUpdate}
                    variant="contained"
                    color="primary"
                    disabled={saving || !label.trim() || label.trim() === type.label}
                >
                    {saving && <CircularProgress size={16} sx={{ mr: 1 }} />}
                    Enregistrer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// --- Composant Principal : ServicesPage ---
export default function ServicesPage() {
    // [LOGIQUE & STATES - Non Modifié]
    const [services, setServices] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [name, setName] = useState("");
    const [telephone, setTelephone] = useState("");
    const [type, setType] = useState("");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [newTypeLabel, setNewTypeLabel] = useState("");
    const [typeSaving, setTypeSaving] = useState(false);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [deletingTypeId, setDeletingTypeId] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filteredServices, setFilteredServices] = useState([]);
    const nameRef = useRef();

    const { search } = useSearch();

    useEffect(() => {
        const load = async () => {
            try {
                const [svc, types] = await Promise.all([getServices(), getServiceTypes()]);
                setServices(svc);
                setServiceTypes(types);
            } catch {
                showToastErr("Impossible de charger les données");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    useEffect(() => {
        if (!debouncedSearch) {
            setFilteredServices(services);
            return;
        }
        const term = debouncedSearch.toLowerCase();
        setFilteredServices(
            services.filter(s =>
                s.name?.toLowerCase().includes(term) ||
                s.telephone?.toLowerCase().includes(term) ||
                serviceTypes.find(t => t.id === s.type)?.label?.toLowerCase().includes(term)
            )
        );
    }, [debouncedSearch, services, serviceTypes]);

    const resetForm = () => {
        setSelectedService(null);
        setName("");
        setTelephone("");
        setType("");
        setErrors({});
    };

    const handleAddClick = () => {
        resetForm();
        setShowForm(true);
        setTimeout(() => nameRef.current?.focus(), 100);
    };

    const handleEdit = (svc) => {
        setSelectedService(svc);
        setName(svc.name);
        setTelephone(svc.telephone || "");
        setType(svc.type);
        setShowForm(true);
    };

    const validate = () => {
        const err = {};
        const trimmedName = name.trim();

        if (!trimmedName) {
            err.name = "Nom requis";
        } else if (trimmedName.length < 2) {
            err.name = "Min. 2 caractères";
        } else {
            const normalized = trimmedName.toLowerCase();
            if (
                services.some(
                    (s) =>
                        s.name.trim().toLowerCase() === normalized &&
                        s.id !== selectedService?.id
                )
            ) {
                err.name = "Ce service existe déjà";
            }
        }

        if (!type) err.type = "Type requis";

        // Ajout : téléphone obligatoire
        const trimmedTel = telephone.trim();
        if (!trimmedTel) {
            err.telephone = "Téléphone requis";
        } else if (!/^(\+?\d{6,})$/.test(trimmedTel)) {
            err.telephone = "Format téléphone invalide";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            const payload = {
                name: name.trim(),
                telephone: telephone.trim(),
                type,
            };

            if (selectedService) {
                await updateService(selectedService.id, payload);
                setServices((prev) =>
                    prev.map((s) => (s.id === selectedService.id ? { ...s, ...payload } : s))
                );
                showToast("Service modifié");
            } else {
                const newId = await addService(payload);
                setServices((prev) => [{ id: newId, ...payload }, ...prev]);
                showToast("Service ajouté");
            }

            setShowForm(false);
        } catch {
            showToastErr("Erreur d'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async (id) => {
        const ok = await showConfirm(
            "Supprimer ce service ?",
            "warning",
            "Supprimer",
            "Action irréversible."
        );
        if (!ok) return;

        try {
            setDeletingId(id);
            await deleteService(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
            showToast("Service supprimé");
        } catch {
            showToastErr("Erreur de suppression");
        } finally {
            setDeletingId(null);
        }
    };

    const addType = async () => {
        const labelTrimmed = newTypeLabel.trim();
        if (!labelTrimmed) return;

        const normalized = labelTrimmed.toLowerCase();
        if (serviceTypes.some((t) => (t.label || t.name)?.trim().toLowerCase() === normalized)) {
            showToastErr("Ce type de service existe déjà.");
            return;
        }

        try {
            setTypeSaving(true);
            const id = await addServiceType({ label: labelTrimmed });
            setServiceTypes((p) => [...p, { id, label: labelTrimmed }]);
            showToast("Type ajouté");
            setShowTypeForm(false);
            setNewTypeLabel("");
        } catch {
            showToastErr("Erreur ajout type");
        } finally {
            setTypeSaving(false);
        }
    };
    
    const handleEditType = (type) => {
        setSelectedType(type);
        setShowTypeDialog(true);
    };

    const handleUpdateTypeInState = (id, newLabel) => {
        setServiceTypes((prev) =>
            prev.map((t) => (t.id === id ? { ...t, label: newLabel } : t))
        );
    };

    const handleDeleteType = async (typeToDelete) => {
        const ok = await showConfirm(
            `Supprimer le type "${typeToDelete.label}" ?`,
            "warning",
            "Supprimer",
            "Ceci n'est possible que si aucun service n'utilise ce type. Action irréversible."
        );
        if (!ok) return;

        try {
            setDeletingTypeId(typeToDelete.id);
            await deleteServiceType(typeToDelete.id);
            setServiceTypes((prev) => prev.filter((t) => t.id !== typeToDelete.id));
            showToast("Type supprimé avec succès");
        } catch {
            showToastErr("Erreur : Impossible de supprimer (type en cours d'utilisation ?)");
        } finally {
            setDeletingTypeId(null);
        }
    };
    // [FIN LOGIQUE & STATES]


    const typeLabel = (id) => serviceTypes.find((t) => t.id === id)?.label ?? "Type inconnu";

    // Définition de la largeur de la colonne des types
    const TYPE_COLUMN_WIDTH = 400;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1 }} color="primary" /> Gestion des Services
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* FORMULAIRE D'AJOUT/ÉDITION DU SERVICE (Reste centré si actif) */}
            {showForm && (
                <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mb: 4 }} elevation={3}>
                    <Typography variant="h6" mb={2}>
                        {selectedService ? "Modifier le service" : "Ajouter un nouveau service"}
                    </Typography>
                    <Stack spacing={2}>
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
                            fullWidth
                        />

                        <TextField
                            label="Téléphone *"
                            value={telephone}
                            onChange={(e) => {
                                setTelephone(e.target.value);
                                if (errors.telephone) validate();
                            }}
                            error={!!errors.telephone}
                            helperText={errors.telephone}
                            fullWidth
                        />

                        <FormControl fullWidth error={!!errors.type}>
                            <InputLabel>Type de service</InputLabel>
                            <Select
                                value={type}
                                label="Type de service"
                                onChange={(e) => setType(e.target.value)}
                            >
                                {serviceTypes.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.label || t.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.type && (
                                <Typography color="error" variant="caption">
                                    {errors.type}
                                </Typography>
                            )}
                        </FormControl>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={1}>
                            <Button variant="outlined" color="error" onClick={() => setShowForm(false)}>
                                Annuler
                            </Button>
                            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                                {saving && <CircularProgress size={16} sx={{ mr: 1 }} />}
                                {selectedService ? "Modifier" : "Ajouter"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* CONTENEUR PRINCIPAL POUR LES SERVICES ET TYPES (Non affiché si le formulaire est ouvert) */}
            {!showForm && (
                <Box sx={{ 
                    // Nous allons centrer la liste des services dans l'espace restant
                    display: 'flex',
                    justifyContent: 'center', // Centre la liste des services
                    position: 'relative',
                    pb: 3, // Espace en bas pour le bouton flottant
                }}>
                    
                    {/* Colonne Principale: LISTE DES SERVICES */}
                    <Box sx={{ 
                        width: '100%', 
                        maxWidth: `calc(100% - ${TYPE_COLUMN_WIDTH + 64}px)`, // Réduit la largeur pour ne pas chevaucher la colonne des types
                        mr: `${TYPE_COLUMN_WIDTH + 32}px`, // Marge pour laisser de l'espace
                        minWidth: 400, // Largeur minimale pour éviter le chevauchement sur les petits écrans
                    }}>
                        
                        <Typography variant="h5" mb={2}>
                            Liste des Services Enregistrés
                        </Typography>
                        <Stack spacing={2}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : services.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: "center" }} elevation={1}>
                                    <Typography>Aucun service enregistré. Utilisez le bouton **+** pour commencer.</Typography>
                                </Paper>
                            ) : (
                                filteredServices.map((s) => (
                                    <Card key={s.id} variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>{s.name}</Typography>
                                            
                                            <Stack direction="row" spacing={3} mt={1} divider={<Divider orientation="vertical" flexItem />}>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <PhoneIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {s.telephone || "Non spécifié"}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <CategoryIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {typeLabel(s.type)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>

                                        <Divider />

                                        <CardActions sx={{ justifyContent: "flex-end" }}>
                                            <Button startIcon={<EditIcon />} onClick={() => handleEdit(s)} size="small">
                                                Modifier
                                            </Button>

                                            <Button
                                                startIcon={deletingId === s.id ? (<CircularProgress size={18} />) : (<DeleteIcon />)}
                                                color="error"
                                                onClick={() => handleDeleteService(s.id)}
                                                disabled={deletingId === s.id}
                                                size="small"
                                            >
                                                Supprimer
                                            </Button>
                                        </CardActions>
                                    </Card>
                                ))
                            )}
                        </Stack>
                    </Box>

                    {/* Colonne Fixe: TYPES DE SERVICE */}
                    <Box sx={{ 
                        position: 'fixed', // Clé pour ne pas scroller
                        top: 100, // Décalage sous le titre principal (ajuster si besoin)
                        right: 24, // Position à droite
                        width: TYPE_COLUMN_WIDTH, // Largeur fixe
                        zIndex: 1000,
                        // Assure que l'élément ne dépasse pas la hauteur de la fenêtre si trop d'éléments
                        maxHeight: 'calc(100vh - 124px)', 
                    }}>
                        <Paper sx={{ p: 3 }} elevation={4}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={2}
                            >
                                <Typography variant="h6" display="flex" alignItems="center">
                                    <CategoryIcon sx={{ mr: 1, color: "secondary.main" }} />
                                    Types de services ({serviceTypes.length})
                                </Typography>
                            </Stack>

                            {/* Formulaire d'ajout rapide de type */}
                                <Stack direction="row" spacing={1} mb={2}>
                                    <TextField
                                        size="small"
                                        label="Nom du nouveau type"
                                        value={newTypeLabel}
                                        onChange={(e) => setNewTypeLabel(e.target.value)}
                                        fullWidth
                                        onKeyDown={(e) => { if (e.key === 'Enter') addType(); }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={addType}
                                        disabled={typeSaving || !newTypeLabel.trim()}
                                    >
                                        {typeSaving ? <CircularProgress size={16} /> : "Ajouter"}
                                    </Button>
                                </Stack>

                            <Divider sx={{ mb: 1 }} />

                            {/* Liste des types avec scroll interne masqué */}
                            <Box sx={{ 
                                maxHeight: 350, // Limite la hauteur de la liste des types
                                overflowY: 'auto', // Permet le scroll interne
                                // Cache la barre de scroll :
                                '&::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari, Opera
                                msOverflowStyle: 'none', // IE and Edge
                                scrollbarWidth: 'none', // Firefox
                            }}>
                                <List dense>
                                    {serviceTypes.length === 0 ? (
                                        <ListItem>
                                            <ListItemText primary="Aucun type de service enregistré." secondary="Ajoutez-en un." />
                                        </ListItem>
                                    ) : (
                                        serviceTypes.map((t) => (
                                            <ListItem
                                                key={t.id}
                                                disableGutters
                                                secondaryAction={
                                                    <Stack direction="row" spacing={1}>
                                                        {/* Bouton MODIFIER */}
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="edit"
                                                            size="small"
                                                            onClick={() => handleEditType(t)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        
                                                        {/* Bouton SUPPRIMER DIRECT */}
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteType(t)}
                                                            disabled={deletingTypeId === t.id}
                                                        >
                                                            {deletingTypeId === t.id ? (
                                                                <CircularProgress size={16} color="error" />
                                                            ) : (
                                                                <DeleteIcon fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </Stack>
                                                }
                                            >
                                                <ListItemText primary={t.label} />
                                            </ListItem>
                                        ))
                                    )}
                                </List>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {/* BOUTON FLOTTANT */}
            {!showForm && (
                <FloatingMenuButton
                    actions={[
                        {
                            label: "Ajouter un service",
                            icon: <AddIcon fontSize="small" />,
                            onClick: handleAddClick,
                        },
                        {
                            label: "Ajouter un type",
                            icon: <CategoryIcon fontSize="small" />,
                            onClick: () => setShowTypeForm(true),
                        },
                    ]}
                />
            )}
            
            {/* MODALE D'ÉDITION DES TYPES */}
            {selectedType && (
                <TypeManagementDialog
                    open={showTypeDialog}
                    onClose={() => {
                        setShowTypeDialog(false);
                        setSelectedType(null);
                    }}
                    type={selectedType}
                    onUpdate={handleUpdateTypeInState}
                />
            )}
        </Box>
    );
}