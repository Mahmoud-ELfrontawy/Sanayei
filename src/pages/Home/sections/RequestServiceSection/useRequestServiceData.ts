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

export const useRequestServiceData = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [sanaei, setSanaei] = useState<Sanaei[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [s, g, sn] = await Promise.all([
                    getServices(),
                    getGovernorates(),
                    getSanaei(),
                ]);

                setServices(s);
                setGovernorates(g);
                setSanaei(sn);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { services, governorates, sanaei, loading };
};

