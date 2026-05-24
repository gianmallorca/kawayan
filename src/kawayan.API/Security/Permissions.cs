namespace kawayan.API.Security;

public static class Permissions
{
    public const string ContentManage = "content.manage";
    public const string MediaManage = "media.manage";

    public static readonly IReadOnlyList<string> All =
    [
        ContentManage,
        MediaManage,
    ];
}
