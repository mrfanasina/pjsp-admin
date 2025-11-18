import { Add } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddArticle = () => {
    setIsOpen(true);
  }
  return (
    <div>

      <Button onClick={handleAddArticle} variant="contained" color="primary">
        <Add /> Ajouter un article
      </Button>
    </div>
  );
}