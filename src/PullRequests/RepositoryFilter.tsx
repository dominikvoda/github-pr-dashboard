import React from "react";
import { Theme, useTheme } from '@mui/material/styles';
import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from "@mui/material";
import { getResponse } from "../GitHub/Api";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export interface RepositoryFilterProps {
  selectedRepositories: any,
  onSelectedRepositoriesChange: (selectedRepositories: any) => void
}


export default function RepositoryFilter(props: RepositoryFilterProps) {

  const [allRepositories, setAllRepositories] = React.useState<string[]>([]);
  const [repositoriesLoaded, setRepositoriesLoaded] = React.useState(false);
  const theme = useTheme();

  function getStyles(repositoryName: string, selectedRepositories: readonly string[], theme: Theme) {
    return {
      fontWeight:
        selectedRepositories.indexOf(repositoryName) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const loadRepositories = async (): Promise<void> => {
    const repositories = await getResponse('/orgs/BrandEmbassy/repos?sort=updated&per_page=100')

    setAllRepositories(repositories.map((repository: any) => (repository.name)));
    setRepositoriesLoaded(true)
  }

  React.useEffect(() => {
    if (!repositoriesLoaded) {
      loadRepositories()
    }
  });

  const handleChange = (event: SelectChangeEvent<typeof allRepositories>) => {
    props.onSelectedRepositoriesChange(event.target.value)
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="repositories-label">Repositories</InputLabel>
      <Select
        labelId="repositories-label"
        multiple
        value={props.selectedRepositories}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip"/>}
        renderValue={(selected) => (
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
            {selected.map((value) => (
              <Chip key={value} label={value} size="small"/>
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {allRepositories.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, props.selectedRepositories, theme)}
          >
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
