import { useMemo } from "react";
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

    const services = servicesQuery.data ?? [];
    const governorates = governoratesQuery.data ?? [];
    
    // Stable filter for sanaei
    const sanaei = useMemo(() => {
        return (sanaeiQuery.data ?? []).filter((w: any) => w.status === 'approved');
    }, [sanaeiQuery.data]);

    return useMemo(() => ({
        services,
        governorates,
        sanaei,
        loading: servicesQuery.isLoading || governoratesQuery.isLoading || sanaeiQuery.isLoading,
        isError: servicesQuery.isError || governoratesQuery.isError || sanaeiQuery.isError,
    }), [services, governorates, sanaei, servicesQuery.isLoading, governoratesQuery.isLoading, sanaeiQuery.isLoading, servicesQuery.isError, governoratesQuery.isError, sanaeiQuery.isError]);
};
