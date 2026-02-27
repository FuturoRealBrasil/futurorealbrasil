export interface UserData {
  renda: number;
  gastos: number;
  temDividas: boolean;
  dependentes: number;
  temReserva: boolean;
  valorReserva: number;
  completedMissions: string[];
  onboardingDone: boolean;
}

const STORAGE_KEY = "futuro-real-brasil";

const defaultData: UserData = {
  renda: 0,
  gastos: 0,
  temDividas: false,
  dependentes: 0,
  temReserva: false,
  valorReserva: 0,
  completedMissions: [],
  onboardingDone: false,
};

export function getUserData(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return { ...defaultData };
  }
}

export function saveUserData(data: Partial<UserData>) {
  const current = getUserData();
  const updated = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearUserData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function calcularFuturo(data: UserData) {
  const saldo = data.renda - data.gastos;
  const mesesAteCrise = saldo > 0 ? Infinity : saldo === 0 ? 0 : Math.abs(data.valorReserva / saldo);
  const diasSemDinheiro = data.valorReserva > 0 ? Math.round((data.valorReserva / data.gastos) * 30) : 0;
  
  const score = Math.min(100, Math.max(0,
    (saldo > 0 ? 30 : 0) +
    (data.temReserva ? 25 : 0) +
    (!data.temDividas ? 20 : 0) +
    (data.dependentes <= 1 ? 15 : data.dependentes <= 3 ? 8 : 0) +
    (saldo > data.renda * 0.2 ? 10 : saldo > 0 ? 5 : 0)
  ));

  return { saldo, mesesAteCrise, diasSemDinheiro, score };
}
