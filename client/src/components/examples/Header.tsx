import Header from '../Header';

export default function HeaderExample() {
  const mockUser = {
    firstName: "Sarah",
    lastName: "Johnson", 
    role: "intern",
    profileImage: undefined
  };

  return <Header currentUser={mockUser} />;
}