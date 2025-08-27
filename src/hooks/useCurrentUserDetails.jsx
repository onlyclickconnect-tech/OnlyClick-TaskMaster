import { useAuth } from "../context/AuthProvider";
function useCurrentUserDetails() {
  const { user, setUser, isLoggedIn } = useAuth();
  const changeUserDetails = (
    user = { user },
    isLoggedIn = { isLoggedIn }
  ) => {};
  return {
    name: user.name,
    email: user.email,
    userAddress: user.address,
    phone: user.phone,
    profileImage: user.profileImage,
    _id: user._id,
    reviews: user.reviews,
    ratings: user.ratings,
    userId: user.taskMasterId,
    service: user.service,
    isLoggedIn,
    authToken: user.authToken,
    refreshToken: user.refreshToken,
  };
}

export default useCurrentUserDetails;
