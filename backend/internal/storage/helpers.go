package storage

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func uuidToPg(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}
}

func uuidToNullablePg(id *uuid.UUID) pgtype.UUID {
	if id == nil {
		return pgtype.UUID{Valid: false}
	}
	return uuidToPg(*id)
}

func pgUUIDToUUID(value pgtype.UUID) (uuid.UUID, bool, error) {
	if !value.Valid {
		return uuid.UUID{}, false, nil
	}
	u, err := uuid.FromBytes(value.Bytes[:])
	if err != nil {
		return uuid.UUID{}, false, err
	}
	return u, true, nil
}

func metadataOrNil(raw json.RawMessage) []byte {
	if len(raw) == 0 {
		return nil
	}
	return []byte(raw)
}

func defaultMetadata(raw json.RawMessage) []byte {
	if len(raw) == 0 {
		return []byte("{}")
	}
	return []byte(raw)
}

func stringPtr(value string) *string {
	return &value
}

func int32Ptr(value int32) *int32 {
	return &value
}
