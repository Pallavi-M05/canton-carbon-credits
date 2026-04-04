# Canton Carbon Credits Marketplace

This project implements a decentralized marketplace for carbon credits on the Canton Network, using the Daml smart contract language. It provides a robust, transparent, and auditable system for the issuance, transfer, and retirement of carbon credits.

The model ensures that each credit is uniquely accounted for, preventing double-spending and providing a permanent, verifiable record of carbon offsetting activities.

## Key Features

*   **Regulated Issuance:** Only authorized registries can issue new carbon credits, ensuring legitimacy.
*   **Project-Based Credits:** Credits are tied to specific carbon reduction projects, providing transparency on their origin.
*   **Detailed Attributes:** Each credit batch includes essential data like vintage year, project type, and a unique project identifier.
*   **Fractional Ownership:** Credits are represented as `Decimal`, allowing for fractional trading and retirement.
*   **Atomic Transfer:** The transfer of ownership is atomic, using the standard Daml proposal/acceptance pattern.
*   **Permanent Retirement:** Retired credits create an immutable `RetirementRecord`, providing a permanent and auditable proof of offsetting that cannot be altered or re-used.
*   **Clear Roles and Permissions:** The system defines distinct roles (Registry, Project Proponent, Corporate) with specific rights, enforced by the Daml ledger.

## Actors and Roles

The marketplace involves several key participants, each with a specific role and set of permissions enforced by smart contracts.

1.  **Operator:** The party that runs the Canton Network and onboards other participants. The Operator grants `RegistryRole` contracts to trusted carbon registries.
2.  **Registry:** An accredited organization (e.g., Verra, Gold Standard) responsible for verifying carbon reduction projects and issuing official carbon credits onto the ledger.
3.  **Project Proponent:** An entity that develops and runs a carbon reduction project (e.g., a reforestation initiative or a renewable energy plant). They request credit issuance from a Registry.
4.  **Corporate:** A company or individual that buys carbon credits to offset their emissions. They are the ultimate consumers who "retire" the credits.

## Core Workflow

The lifecycle of a carbon credit on this platform follows these steps:

1.  **Onboarding:** The `Operator` invites and grants roles to participants. For instance, a trusted registry is given a `RegistryRole` contract, allowing it to perform its functions on the network.
2.  **Project Registration:** A `ProjectProponent` submits their project details to a `Registry` for approval. The `Registry` reviews and, upon approval, creates a `Project` contract on the ledger.
3.  **Credit Issuance:** Based on verified carbon reductions, the `Registry` issues a `CarbonCreditBatch` contract for a specific `Project`. This contract represents a fungible quantity of credits with shared attributes (e.g., 1000.0 credits from Vintage 2023 for Project XYZ). The initial owner is the `ProjectProponent`.
4.  **Transfer:** The `ProjectProponent` (or any subsequent owner) can sell or transfer a `CarbonCreditBatch`. This is handled via a `CreditTransferProposal` which, when accepted by the new owner, atomically archives the old batch and creates a new one in the recipient's name. The model supports splitting batches.
5.  **Retirement:** The final owner (typically a `Corporate`) retires a specific quantity of credits to claim the environmental benefit. This is the final step in a credit's lifecycle.
    *   The owner exercises the `Retire` choice on a `CarbonCreditBatch`.
    *   This action archives the `CarbonCreditBatch` (or reduces its quantity).
    *   A new, non-transferable `RetirementRecord` contract is created. This contract serves as a permanent, public proof that the specified quantity of credits has been removed from circulation.

## Daml Contract Model

The logic is encapsulated in several key Daml templates:

*   **`Role.daml`**: Defines the permissioning contracts for each participant.
    *   `OperatorRole`, `RegistryRole`, `ProjectProponentRole`, `CorporateRole`.
*   **`Project.daml`**:
    *   `Project`: Represents a verified carbon reduction project with details like ID, name, type (e.g., "Reforestation"), and the responsible registry.
*   **`Credit.daml`**:
    *   `CarbonCreditBatch`: The core asset contract. Represents a fungible quantity of carbon credits. It contains a reference to the `Project`, the owner, quantity, vintage year, and issuance date.
    *   `RetirementRecord`: An immutable record created when credits are retired. It details who retired the credits, the quantity, the project origin, and the retirement date. It is observable by all key parties to ensure transparency.
*   **`Transfer.daml`**:
    *   `CreditTransferProposal`: A standard proposal/acceptance contract used to manage the atomic transfer of `CarbonCreditBatch` ownership between two parties.

## Getting Started

### Prerequisites

*   Daml SDK version 3.1.0 or later. [Installation Guide](https://docs.daml.com/getting-started/installation.html)
*   Java Development Kit (JDK) version 11 or higher.

### Build and Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd canton-carbon-credits
    ```

2.  **Build the Daml model:**
    This command compiles the Daml code into a DAR (Daml Archive) file.
    ```bash
    daml build
    ```

3.  **Start the local ledger (Sandbox):**
    This command starts a local Canton ledger, allocates parties, and uploads the DAR.
    ```bash
    daml start
    ```

4.  **Run the initialization script:**
    The `Setup.daml` script in the `daml/Script` directory demonstrates the full workflow. It allocates parties, sets up roles, registers a project, issues credits, transfers them, and finally retires them.

    To run it:
    ```bash
    daml script --dar .daml/dist/canton-carbon-credits-0.1.0.dar --script-name Script.Setup:runSetup --ledger-host localhost --ledger-port 6865
    ```

This will print the transaction log to the console, showing the creation and evolution of contracts through the entire lifecycle. You can also inspect the ledger state via the Navigator UI, typically available at `http://localhost:7500`.