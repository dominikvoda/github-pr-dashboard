import React from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { getAllRepositoryNames } from "../GitHub/Api";
import { PullRequestFilter } from "./PullRequestFilter";


export interface RepositoryFilterProps {
  pullRequestFilter: PullRequestFilter,
  onSelectedRepositoriesChange: (selectedRepositories: any) => void
}


export default function RepositoryFilter(props: RepositoryFilterProps) {

  const [allRepositories, setAllRepositories] = React.useState<string[]>([]);

  React.useEffect(() => {
    const loadRepositories = async (): Promise<void> => {
      const repositories = await getAllRepositoryNames()
      setAllRepositories(repositories)
    }
    loadRepositories()
  }, [props.pullRequestFilter]);

  const handleChange = (event: React.SyntheticEvent, value: Array<string>): void => {
    props.onSelectedRepositoriesChange(value)
  };

  return (<Autocomplete
      multiple
      id="tags-standard"
      options={allRepositories}
      value={props.pullRequestFilter.repositories}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Repository"
        />
      )}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip label={option} {...getTagProps({index})} size="small"/>
        ))
      }
    />
  );
}
