import { Add } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { addArticle, getArticles } from "../services/solde.js";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Formulaire d'ajout
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Charger les articles au montage
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticles();
      setArticles(data);
    } catch (err) {
      setError("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = () => {
    setContent("");
    setFormError("");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormError("");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setFormError("Le texte est requis");
      return;
    }
    setSaving(true);
    try {
      await addArticle({ content: content.trim() });
      setIsOpen(false);
      fetchArticles();
    } catch (err) {
      setFormError("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Articles</Typography>
        <Button onClick={handleAddArticle} variant="contained" color="primary" startIcon={<Add />}>
          Ajouter un article
        </Button>
      </Stack>

      {/* Liste des articles */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : articles.length === 0 ? (
        <Typography>Aucun article enregistré.</Typography>
      ) : (
        <List>
          {articles.map((article) => (
            <ListItem key={article.id} divider>
              <ListItemText
                primary={article.content}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un article</DialogTitle>
        <DialogContent>
          <TextField
            label="Texte"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            required
            autoFocus
            error={!!formError}
            helperText={formError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}