import React, { useContext } from 'react';
import { Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../AppContext';
import "../../styling/AttributeFilterChips.css"

const AttributeFilterChips = () => {
  const { attributeFilterChips, setAttributeFilterChips } = useContext(AppContext);

  const handleDeleteChip = (id) => {
    const updatedChips = attributeFilterChips.filter(chip => chip.id !== id);
    setAttributeFilterChips(updatedChips);
  };

  return (
    <div>
      {attributeFilterChips.map(chip => (
        <Chip
          key={chip.id}
          label={chip.name}
          onDelete={() => handleDeleteChip(chip.id)}
          deleteIcon={<IconButton size="small"><CloseIcon /></IconButton>}
          variant = "outlined"
          className='filter-chip'
        />
      ))}
    </div>
  );
};

export default AttributeFilterChips;
