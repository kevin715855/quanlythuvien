import type { ReservationsGateway } from "../../application/ports/library.gateways";
import type { AllocateReservationInput, Reservation } from "../../domain/reservation";
import type { HttpClient } from "../http/http-client";

export class HttpReservationsGateway implements ReservationsGateway {
  constructor(private readonly client: HttpClient) {}
  place(input: AllocateReservationInput) { return this.client.post<Reservation>("/reservations", input); }
  listByReader(readerId: string) {
    return this.client.get<Reservation[]>(`/reservations/readers/${encodeURIComponent(readerId)}`);
  }
  cancel(reservationId: string, reason: string) {
    return this.client.post<Reservation>(`/reservations/${encodeURIComponent(reservationId)}/cancel`, { reason });
  }
  allocate(input: AllocateReservationInput) {
    return this.client.post<Reservation | null>("/reservations/allocate", input);
  }
}
