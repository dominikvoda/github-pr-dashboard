import React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import { getResponse } from "../GitHub/Api";
import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from "@mui/material";
import arrayUnique from "array-unique";

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

export interface LabelFilterProps {
  selectedRepositories: any,
  selectedLabels: any,
  onSelectedLabelsChange: (selectedLabels: any) => void
}

export default function LabelFilter(props: LabelFilterProps) {

  const [allLabels, setAllLabels] = React.useState<string[]>([]);
  const [labelsLoaded, setLabelsLoaded] = React.useState(false);
  const theme = useTheme();

  function getStyles(repositoryName: string, selectedRepositories: readonly string[], theme: Theme) {
    return {
      fontWeight:
        selectedRepositories.indexOf(repositoryName) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const loadLabels = async (): Promise<void> => {
    const allLabels = props.selectedRepositories.map(function (repository: string) {
      return loadLabelsInRepository(repository)
    })

    Promise.all(allLabels).then((result: any) => {
      let allLabels = arrayUnique([].concat.apply([], result));
      setAllLabels(allLabels)
      setLabelsLoaded(true)
    })
  }

  const loadLabelsInRepository = async (repository: string): Promise<any> => {
    const labels = await getResponse('/repos/BrandEmbassy/' + repository + '/labels')

    return labels.map((label: any) => {
      return label.name
    })
  }

  React.useEffect(() => {
    if (!labelsLoaded) {
      loadLabels()
    }
  });

  const handleChange = (event: SelectChangeEvent<typeof allLabels>) => {
    props.onSelectedLabelsChange(event.target.value)
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="labels-label">Labels</InputLabel>
      <Select
        labelId="labels-label"
        multiple
        value={props.selectedLabels}
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
        {allLabels.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, props.selectedLabels, theme)}
          >
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
