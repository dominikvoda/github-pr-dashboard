import { useCallback, useEffect, useState } from "react";
import { getJsonResponse } from "../GitHub/Api";

export interface GhProfile {
  name: string,
  avatar_url: string,
  login: string | null,
  id: string | undefined,
}

enum LoadingState {
  IDLE,
  LOADING,
  LOADED
}

export const useGhProfile = () => {
  const [ghProfile, setGhProfile] = useState<GhProfile>({name: '', avatar_url: '', login: null, id: undefined})
  const [profileLoadingStatus, setProfileLoadingStatus] = useState<LoadingState>(LoadingState.IDLE);

  const loadProfile = useCallback(async (): Promise<void> => {
    setProfileLoadingStatus(LoadingState.LOADING)
    const profileData = await getJsonResponse('/user')
    setGhProfile(profileData);
    setProfileLoadingStatus(LoadingState.LOADED)
  }, [])

  useEffect(() => {
    if (profileLoadingStatus === LoadingState.IDLE) {
      loadProfile()
    }
  }, [loadProfile, profileLoadingStatus]);

  return ghProfile
}
