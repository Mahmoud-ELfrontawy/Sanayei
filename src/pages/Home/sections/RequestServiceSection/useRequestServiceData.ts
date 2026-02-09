import { useQuery } from "@tanstack/react-query";
import { getServices } from "../../../../Api/services.api";
import { getGovernorates } from "../../../../Api/serviceRequest/governorates.api";
import { getSanaei } from "../../../../Api/serviceRequest/sanaei.api";

export const useRequestServiceData = () => {
    const servicesQuery = useQuery({ 
        queryKey: ["services"], 
        queryFn: getServices 
    });

    const governoratesQuery = useQuery({ 
        queryKey: ["governorates"], 
        queryFn: getGovernorates 
    });

    const sanaeiQuery = useQuery({ 
        queryKey: ["sanaei"], 
        queryFn: getSanaei 
    });

    return {
        services: servicesQuery.data ?? [],
        governorates: governoratesQuery.data ?? [],
        sanaei: sanaeiQuery.data ?? [],
        loading: servicesQuery.isLoading || governoratesQuery.isLoading || sanaeiQuery.isLoading,
        isError: servicesQuery.isError || governoratesQuery.isError || sanaeiQuery.isError,
    };
};
