export interface GithubLabel {
  name: string,
  color: string
}

export function getLabelStyle(label: GithubLabel) {
  return {
    backgroundColor: '#' + label.color,
    marginLeft: '3px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600
  }
}
