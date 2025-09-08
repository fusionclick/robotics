  const axios = require("axios");
  const beforeModeCall = async () => {
          try {
            const response = await axios.get(
              "https://smart.smartwingamez.net/api/winning-hotlist?game_name=jeetoJokerprint"
            );
            return response.data;
          } catch (error) {
            console.error("Error fetching data: ", error);
            throw error;
          }
        };
        const beforeStart=await beforeModeCall();
        console.log(beforeStart)