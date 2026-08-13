import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const EmissionFactorManagement = () => {
  const { t } = useTranslation();
  const [factors, setFactors] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFactor, setEditFactor] = useState('');
  const [editVersion, setEditVersion] = useState('1.0');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFactors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/emission-factors');
      if (res.data.success) {
        setFactors(res.data.data);
      }
    } catch (e) {
      setError(t('admin.errorRetrieveFactors'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleEditClick = (factor) => {
    setEditId(factor.id);
    setEditFactor(factor.factor.toString());
    setEditVersion(factor.version);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put(`/api/admin/emission-factors/${editId}?factor=${parseFloat(editFactor)}&version=${editVersion}`);
      if (res.data.success) {
        setSuccess(t('admin.factorsSuccessUpdate'));
        setEditId(null);
        fetchFactors();
      }
    } catch (err) {
      setError(t('admin.errorUpdateFactor'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditId(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>{t('admin.factorsLoading')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        {t('admin.factorsTitle')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Edit Form (Hidden if not active) */}
      {editId && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
              {t('admin.factorsEditTitle')}
            </Typography>
            <form onSubmit={handleSave}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label={t('admin.factorsTableCoefficient')}
                  type="number"
                  required
                  value={editFactor}
                  onChange={(e) => setEditFactor(e.target.value)}
                  inputProps={{ step: 'any' }}
                />
                <TextField
                  label={t('admin.factorVersion')}
                  required
                  value={editVersion}
                  onChange={(e) => setEditVersion(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" disabled={saving}>
                  {saving ? t('common.saving') : t('common.save')}
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Factors Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.factorsTableCategory')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.factorsTableType')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.factorsTableUnit')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">{t('admin.factorCoefficient')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.versionShort')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.factorSource')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">{t('common.edit')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factors.map((f) => (
              <TableRow key={f.id} sx={{ opacity: f.active ? 1 : 0.5 }}>
                <TableCell sx={{ fontWeight: 700 }}>{f.category}</TableCell>
                <TableCell>{f.activityType}</TableCell>
                <TableCell>{f.unit}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {f.factor}
                </TableCell>
                <TableCell>{f.version}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{f.source}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" size="small" onClick={() => handleEditClick(f)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EmissionFactorManagement;
