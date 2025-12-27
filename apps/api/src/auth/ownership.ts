export function canActOnOwnedResource(opts: {
    userId: string;
    permissions: string[];
    ownerId: string;
    domain: string;
    action: "update" | "delete";
}) {
    const { permissions, userId, ownerId, domain, action } = opts;

    if (permissions.includes(`${domain}:moderate`)) return true;

    if (permissions.includes(`${domain}:${action}`) && userId === ownerId) return true;

    return false;
}
