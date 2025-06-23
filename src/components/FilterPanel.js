import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const FilterPanel = ({
  open,
  onClose,
  filters,
  setFilters,
  options,
  onReset
}) => {
  const handleChange = (field) => (event, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Products</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          options={options.subCategories}
          value={filters.subCategories}
          onChange={handleChange('subCategories')}
          renderInput={(params) => <TextField {...params} label="Sub-Category" margin="normal" />}
        />
        <Autocomplete
          multiple
          options={options.brands}
          value={filters.brands}
          onChange={handleChange('brands')}
          renderInput={(params) => <TextField {...params} label="Brand" margin="normal" />}
        />
        <Autocomplete
          multiple
          options={options.priceTiers}
          value={filters.priceTiers}
          onChange={handleChange('priceTiers')}
          renderInput={(params) => <TextField {...params} label="Price Tier" margin="normal" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onReset} color="secondary">Reset Filters</Button>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(FilterPanel); 