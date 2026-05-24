namespace kawayan.API;

public static class UploadLimits
{
    public const int MaxImageMegabytes = 15;
    public const long MaxImageBytes = MaxImageMegabytes * 1024L * 1024L;
}
