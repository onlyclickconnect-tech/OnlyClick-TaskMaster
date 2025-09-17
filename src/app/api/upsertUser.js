// this will insert user if not exist and if exist this will update that user

import api from "./api";

export const upsertUser = async (dataObj)=>{
    try{
        const {data, error} = api.post('/api/v1/upsertTM', dataObj);
        if(error){
            throw error;
        }
        return{data};
    }catch(error){
        console.log("error inserting/updating user: ", error.message);
        return {error};
    }
}