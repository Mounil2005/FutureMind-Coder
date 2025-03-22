import { useState } from "react";

const LeetCodeInput = ({ setLeetCodeUsername }) => {
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    setUsername(e.target.value); // Update local state
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setLeetCodeUsername(username); // Send to parent on Enter
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        placeholder="LeetCode Username"
        className="font-medium pl-2 border-2 rounded-lg px-2 py-1"
        value={username}
        onChange={handleChange}
        onKeyDown={handleKeyPress} // Listen for Enter key
      />
    </div>
  );
};

export default LeetCodeInput;
