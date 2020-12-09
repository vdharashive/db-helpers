insert into service_providers (service_provider_sid, name) 
values ('3f35518f-5a0d-4c2e-90a5-2407bb3b36f0', 'SP A');

insert into webhooks(webhook_sid, url, username, password) values('6c6a4deb-a0f3-4c22-aa1b-e95a009ad540', 'http://example.com/spreg', 'foo', 'bar');

insert into service_providers (service_provider_sid, name, root_domain, registration_hook_sid) 
values ('a79d3ade-e0da-4461-80f3-7c73f01e18b4', 'SP B', 'example.com','6c6a4deb-a0f3-4c22-aa1b-e95a009ad540');
insert into service_providers (service_provider_sid, name, root_domain, registration_hook_sid, ms_teams_fqdn) 
values ('7e306626-4ee9-471b-af8d-27d9f6042fc9', 'SP C', 'drachtio.org','6c6a4deb-a0f3-4c22-aa1b-e95a009ad540', 'customers.drachtio.org');

insert into webhooks(webhook_sid, url) values('4ff0c800-a4a2-4f66-a008-ac57dfb8f60f', 'http://example.com/accountreg');

insert into accounts (account_sid, name, service_provider_sid, sip_realm)
values ('ee9d7d49-b3e4-4fdb-9d66-661149f717e8', 'Account A1', '3f35518f-5a0d-4c2e-90a5-2407bb3b36f0', 'sip.drachtio.org');
insert into accounts (account_sid, name, service_provider_sid, sip_realm, registration_hook_sid)
values ('5f190a4f-b997-4f04-b56e-03c627ea547d', 'Account A2', '3f35518f-5a0d-4c2e-90a5-2407bb3b36f0', 'customerA.mycompany.com', '4ff0c800-a4a2-4f66-a008-ac57dfb8f60f');

insert into voip_carriers (voip_carrier_sid, name, e164_leading_plus, requires_register, register_username, register_sip_realm, register_password) 
values ('287c1452-620d-4195-9f19-c9814ef90d78', 'westco', 1, 1, 'janedoe', 'mydomain.com', 'test123');
insert into sip_gateways (sip_gateway_sid, voip_carrier_sid, ipv4, inbound, outbound) 
values ('124a5339-c62c-4075-9e19-f4de70a96597', '287c1452-620d-4195-9f19-c9814ef90d78', '3.3.3.3', true, true);
insert into sip_gateways (sip_gateway_sid, voip_carrier_sid, ipv4, port, inbound, outbound) 
values ('efbc4830-57cd-4c78-a56f-d64fdf210fe8', '287c1452-620d-4195-9f19-c9814ef90d78', '3.3.3.3', 5062, false, true);

insert into lcr_routes (lcr_route_sid, regex, priority) values ('850e14dd-a641-477f-8000-5a0573208fc2', '^44', 1);
insert into lcr_routes (lcr_route_sid, regex, priority) values ('13d952da-563a-45a5-99d5-2f4c928bfb39', '^1', 2);

insert into lcr_carrier_set_entry (lcr_carrier_set_entry_sid, lcr_route_sid, priority, voip_carrier_sid)
values ('b015ae6a-b506-454e-80c1-c68c4b43d934', '850e14dd-a641-477f-8000-5a0573208fc2', 1, '287c1452-620d-4195-9f19-c9814ef90d78');

insert into accounts (account_sid, name, service_provider_sid) 
values('422affb5-4d1e-45e8-b2a4-2623f08b95ef', 'test', '7e306626-4ee9-471b-af8d-27d9f6042fc9');

insert into webhooks(webhook_sid, url) values('90dda62e-0ea2-47d1-8164-5bd49003476c', 'http://example.com');
insert into webhooks(webhook_sid, url) values('4d7ce0aa-5ead-4e61-9a6b-3daa732218b1', 'http://example.com/status');
insert into webhooks(webhook_sid, url) values('15e665d4-5c94-435b-9a9b-50fc705bd447', 'http://example.com/sms');

insert into applications (application_sid, name, account_sid, call_hook_sid, call_status_hook_sid, messaging_hook_sid)
values ('3b43e39f-4346-4218-8434-a53130e8be49', 'test', '422affb5-4d1e-45e8-b2a4-2623f08b95ef', 
'90dda62e-0ea2-47d1-8164-5bd49003476c', '4d7ce0aa-5ead-4e61-9a6b-3daa732218b1', '15e665d4-5c94-435b-9a9b-50fc705bd447');

update accounts set device_calling_application_sid = '3b43e39f-4346-4218-8434-a53130e8be49' where account_sid = 'ee9d7d49-b3e4-4fdb-9d66-661149f717e8';

insert into phone_numbers (phone_number_sid, number, voip_carrier_sid, account_sid, application_sid)
values ('5cd93593-fe66-443c-9ab3-4f52c13c3d28', '15083084809', '287c1452-620d-4195-9f19-c9814ef90d78', '422affb5-4d1e-45e8-b2a4-2623f08b95ef', '3b43e39f-4346-4218-8434-a53130e8be49');

insert into ms_teams_tenants (ms_teams_tenant_sid,service_provider_sid,account_sid,application_sid,tenant_fqdn)
values ('11446d20-9c92-4a33-80f3-90d0132a0b83','7e306626-4ee9-471b-af8d-27d9f6042fc9','422affb5-4d1e-45e8-b2a4-2623f08b95ef','3b43e39f-4346-4218-8434-a53130e8be49','daveh.customers.drachtio.org');