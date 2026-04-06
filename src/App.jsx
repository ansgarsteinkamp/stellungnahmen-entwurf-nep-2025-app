import { useState } from "react";

import Dropzone from "@/components/Dropzone";
import AppAuswahl from "@/pages/AppAuswahl";

const App = () => {
   const [data, setData] = useState(null);

   if (!data) return <Dropzone onDataLoaded={setData} />;

   return <AppAuswahl data={data} />;
};

export default App;
