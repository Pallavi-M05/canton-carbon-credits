import { ContractId, Party } from '@daml/types';

// =================================================================================================
// Configuration
// =================================================================================================

const LEDGER_URL = 'http://localhost:7575'; // Default Canton JSON API endpoint

// =================================================================================================
// Type Definitions
// =================================================================================================

// Matches the Daml 'Registry.Credit' template
export interface Credit {
  issuer: Party;
  owner: Party;
  registry: Party;
  quantity: string; // Daml Decimal is a string in JSON
  vintageYear: number;
  projectType: string;
  projectId: string;
}

// Matches the Daml 'Retirement.RetirementProposal' template
export interface RetirementProposal {
  credit: Credit;
  owner: Party;
  registry: Party;
  reason: string;
}

// Matches the Daml 'Retirement.RetiredCredit' template
export interface RetiredCredit {
  issuer: Party;
  owner: Party;
  registry: Party;
  quantity: string;
  vintageYear: number;
  projectType: string;
  projectId: string;
  reason: string;
  retirementDate: string; // Daml Date is a string in "YYYY-MM-DD" format
}

// Generic type for a Daml contract fetched from the JSON API
export interface DamlContract<T> {
  contractId: ContractId<T>;
  templateId: string;
  payload: T;
}

// =================================================================================================
// Generic Ledger Interaction
// =================================================================================================

/**
 * A generic function to send requests to the Canton JSON API.
 * @param endpoint The API endpoint (e.g., '/v1/query').
 * @param token The JWT token for authorization.
 * @param body The request payload.
 * @returns The JSON response from the API.
 */
async function ledgerRequest(endpoint: string, token: string, body: object): Promise<any> {
  const response = await fetch(`${LEDGER_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Ledger request failed:', errorBody);
    throw new Error(`Ledger request failed with status ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// =================================================================================================
// Credit Operations
// =================================================================================================

/**
 * Fetches all active carbon credits for a given party.
 * @param party The party for whom to fetch credits.
 * @param token The JWT token for authorization.
 * @returns A promise that resolves to an array of Credit contracts.
 */
export const getCredits = async (party: Party, token: string): Promise<DamlContract<Credit>[]> => {
  const body = {
    templateIds: ['Registry:Credit'],
    query: { owner: party },
  };
  const response = await ledgerRequest('/v1/query', token, body);
  return response.result || [];
};

/**
 * Exercises the 'Split' choice on a Credit contract.
 * @param contractId The ContractId of the Credit to split.
 * @param party The party exercising the choice (must be the owner).
 * @param amounts An array of decimal strings representing the new quantities.
 * @param token The JWT token for authorization.
 * @returns The result of the exercise command.
 */
export const splitCredit = async (
  contractId: ContractId<Credit>,
  party: Party,
  amounts: string[],
  token: string
) => {
  const body = {
    templateId: 'Registry:Credit',
    contractId,
    choice: 'Split',
    argument: {
      amounts,
    },
  };
  return ledgerRequest('/v1/exercise', token, body);
};

/**
 * Exercises the 'Propose_Retire' choice on a Credit contract to initiate retirement.
 * @param contractId The ContractId of the Credit to retire.
 * @param party The party exercising the choice (the owner).
 * @param reason A text string explaining the reason for retirement.
 * @param token The JWT token for authorization.
 * @returns The result of the exercise command, which includes the new RetirementProposal contract.
 */
export const proposeRetirement = async (
  contractId: ContractId<Credit>,
  party: Party,
  reason: string,
  token: string
) => {
  const body = {
    templateId: 'Registry:Credit',
    contractId,
    choice: 'Propose_Retire',
    argument: {
      reason,
    },
  };
  return ledgerRequest('/v1/exercise', token, body);
};


// =================================================================================================
// Retirement Operations
// =================================================================================================

/**
 * Fetches all active retirement proposals for a given party.
 * This is typically used by a registry to see pending retirements.
 * @param party The registry party.
 * @param token The JWT token for authorization.
 * @returns A promise that resolves to an array of RetirementProposal contracts.
 */
export const getRetirementProposals = async (party: Party, token: string): Promise<DamlContract<RetirementProposal>[]> => {
    const body = {
      templateIds: ['Retirement:RetirementProposal'],
      query: { registry: party },
    };
    const response = await ledgerRequest('/v1/query', token, body);
    return response.result || [];
  };

/**
 * Exercises the 'Accept' choice on a RetirementProposal, completing the retirement.
 * @param contractId The ContractId of the RetirementProposal to accept.
 * @param party The party exercising the choice (the registry).
 * @param token The JWT token for authorization.
 * @returns The result of the exercise command, which includes the new RetiredCredit contract.
 */
export const acceptRetirement = async (
  contractId: ContractId<RetirementProposal>,
  party: Party,
  token: string
) => {
  const body = {
    templateId: 'Retirement:RetirementProposal',
    contractId,
    choice: 'Accept',
    argument: {},
  };
  return ledgerRequest('/v1/exercise', token, body);
};


/**
 * Fetches all permanently retired credits.
 * These are public records of retired credits.
 * @param token The JWT token for authorization.
 * @returns A promise that resolves to an array of RetiredCredit contracts.
 */
export const getRetiredCredits = async (token: string): Promise<DamlContract<RetiredCredit>[]> => {
    const body = {
      templateIds: ['Retirement:RetiredCredit'],
    };
    const response = await ledgerRequest('/v1/query', token, body);
    return response.result || [];
  };