import { useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { AppContext } from "../../AppContext";
import "../../styling/GroupAutocomplete.css";

const GroupAutocomplete = ({
  handleGroupSelect,
  setSelectedGroup,
  groupInputValue,
  setGroupInputValue,
  classNameToUse
}) => {
  let { groups } = useContext(AppContext);

  return (
    <Autocomplete
      freeSolo
      className={classNameToUse}
      options={groups.map((group) => group.name)}
      value={groupInputValue}
      onChange={(event, newValue) => {
        setSelectedGroup(newValue);
        setGroupInputValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setGroupInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Groups"
          variant="outlined"
          onKeyDown={handleGroupSelect}
        />
      )}
    />
  );
};

export default GroupAutocomplete;
