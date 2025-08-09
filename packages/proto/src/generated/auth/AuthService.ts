// Original file: src/proto/auth.proto

import type { MethodDefinition } from '@grpc/proto-loader'
import type { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../google/protobuf/Empty';
import type { RegisterDto as _auth_RegisterDto, RegisterDto__Output as _auth_RegisterDto__Output } from '../auth/RegisterDto';

export interface AuthServiceDefinition {
  credentialsRegister: MethodDefinition<_auth_RegisterDto, _google_protobuf_Empty, _auth_RegisterDto__Output, _google_protobuf_Empty__Output>
}
