import React from 'react';
import { Grid, TextField } from '@mui/material';
import '../../styling/ShowMoreForms.css';

const ShowMoreForms = (
  { 
    duration, 
    winnerScore, 
    notes, 
    onDurationChange, 
    onWinnerScoreChange, 
    onNotesChange 
  }
) => {
  return (
    <div className="show-more-forms">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Duration"
            variant="outlined"
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            className="text-field"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Winner's Score"
            variant="outlined"
            value={winnerScore}
            onChange={(e) => onWinnerScoreChange(e.target.value)}
            className="text-field"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="text-field"
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default ShowMoreForms;
