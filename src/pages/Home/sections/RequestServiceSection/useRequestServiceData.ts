// (hook مسؤول عن جلب الداتا فقط)

import { useEffect, useState } from "react";
import { getServices } from "../../../../Api/services.api";
import type { Service } from "../../../../constants/service";
import {
    getGovernorates,
    type Governorate,
} from "../../../../Api/serviceRequest/governorates.api";
import {
    getSanaei,
    type Sanaei,
} from "../../../../Api/serviceRequest/sanaei.api";

export function useRequestServiceData() {
    const [services, setServices] = useState<Service[]>([]);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [sanaei, setSanaei] = useState<Sanaei[]>([]);

    useEffect(() => {
        getServices()
            .then(setServices)
            .catch(() => setServices([]));

        getGovernorates()
            .then(setGovernorates)
            .catch(() => setGovernorates([]));

        getSanaei()
            .then(setSanaei)
            .catch(() => setSanaei([]));
    }, []);

    return {
        services,
        governorates,
        sanaei,
    };
}
