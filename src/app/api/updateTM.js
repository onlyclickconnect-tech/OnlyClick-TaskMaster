// this will insert user if not exist and if exist this will update that user

import api from "./api";

export const updateTM = async (dataObj)=>{
    console.log(dataObj);
    try{
        const {data, error} = await api.post('/api/v1/updateTM', {dataObj});
        if(error){
            throw error;
        }
        return{data};
    }catch(error){
        console.log("error inserting/updating user: ", error);
        return {error};
    }
}

