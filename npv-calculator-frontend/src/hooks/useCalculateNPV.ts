'use client'

import {type Dispatch, type SetStateAction, useEffect, useState} from "react";
import type {NPVCalculationRequest} from "../types/api.ts";

const API_BASE_URL = 'http://localhost:5252';
export const useCalculateNPV = (requestBody: NPVCalculationRequest, submit: boolean, setSubmit: Dispatch<SetStateAction<boolean>>) => {
    const [npvValues, setNpvValues] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const getCalculateNPV = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/NPVCalculation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                console.error('Failed to calculate NPV', response.body);
            }

            setNpvValues(await response.json() as number[]);

        } catch (error) {
            console.error('An unexpected error occurred while calculating NPV', error);
        }
        finally {
            setSubmit(false)
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (submit) void getCalculateNPV()
    }, [submit])
    
    return { npvValues, loading }
}