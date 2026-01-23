import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.href = "/sandbox.html";
  }, []);

  return null;
};

export default Index;
