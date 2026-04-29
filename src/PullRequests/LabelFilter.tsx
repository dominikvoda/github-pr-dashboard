import React from "react";
import { getJsonResponse } from "../GitHub/Api";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { PullRequestFilter } from "./PullRequestFilter";
import { getLabelStyle, GithubLabel } from "../GitHub/GithubLabel";

export interface LabelFilterProps {
  pullRequestFilter: PullRequestFilter,
  onSelectedLabelsChange: (selectedLabels: any) => void
}

const LABEL_CACHE_TTL_MS = 5 * 60 * 1000
const labelCache = new Map<string, { labels: GithubLabel[]; expiresAt: number }>()

const labelCacheKey = (repository: string): string => {
  const token = localStorage.getItem('githubToken') ?? ''
  return token + ':' + repository
}

const loadLabelsInRepository = async (repository: string): Promise<GithubLabel[]> => {
  const key = labelCacheKey(repository)
  const cached = labelCache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.labels
  }

  const labels: GithubLabel[] = await getJsonResponse('/repos/BrandEmbassy/' + repository + '/labels')
  labelCache.set(key, { labels, expiresAt: Date.now() + LABEL_CACHE_TTL_MS })
  return labels
}

export default function LabelFilter(props: LabelFilterProps) {
  const [allLabels, setAllLabels] = React.useState<GithubLabel[]>([]);

  const loadLabels = async (): Promise<void> => {
    const allLabels = props.pullRequestFilter.repositories.map(function (repository: string) {
      return loadLabelsInRepository(repository)
    })

    Promise.all(allLabels).then((result: GithubLabel[][]) => {
      let filteredLabels: GithubLabel[] = []

      result.forEach((labels: GithubLabel[]) => {
        labels.forEach((label: GithubLabel) => {
          if (!filteredLabels.some(filteredLabel => filteredLabel.name === label.name)) {
            filteredLabels.push(label)
          }
        })
      })

      setAllLabels(filteredLabels)
    })
  }

  React.useEffect(() => {
    loadLabels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pullRequestFilter]);

  const handleChange = (event: React.SyntheticEvent, value: Array<string>): void => {
    props.onSelectedLabelsChange(allLabels.filter((label) => value.includes(label.name)))
  };

  function getLabelByName(labelName: string): GithubLabel {
    return  props.pullRequestFilter.labels.filter(label => label.name === labelName)[0];
  }

  return (
    <Autocomplete
      multiple
      id="tags-standard"
      options={allLabels.map((label) => label.name)}
      value={props.pullRequestFilter.labels.map((label) => label.name)}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Labels"
          placeholder="Review ready"
        />
      )}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            label={option} {...getTagProps({index})}
            size="small" style={getLabelStyle(getLabelByName(option))} sx={{height: 18}}/>
        ))
      }
    />
  )
}
