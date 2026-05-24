using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace kawayan.API.Services;

public class R2StorageService
{
    private readonly AmazonS3Client? _client;
    private readonly string _bucketName = string.Empty;
    private readonly string _publicUrl = string.Empty;

    public bool IsConfigured => _client is not null;

    public R2StorageService(IConfiguration config)
    {
        var accessKey = config["R2:AccessKey"];
        var secretKey = config["R2:SecretKey"];
        var endpoint = config["R2:Endpoint"];
        var bucketName = config["R2:BucketName"];
        var publicUrl = config["R2:PublicUrl"];

        if (string.IsNullOrWhiteSpace(accessKey)
            || string.IsNullOrWhiteSpace(secretKey)
            || string.IsNullOrWhiteSpace(endpoint)
            || string.IsNullOrWhiteSpace(bucketName)
            || string.IsNullOrWhiteSpace(publicUrl))
        {
            return;
        }

        _bucketName = bucketName.Trim();
        _publicUrl = publicUrl.Trim().TrimEnd('/');
        _client = new AmazonS3Client(
            new BasicAWSCredentials(accessKey.Trim(), secretKey.Trim()),
            new AmazonS3Config
            {
                ServiceURL = endpoint.Trim(),
                ForcePathStyle = true,
                AuthenticationRegion = "auto"
            });
    }

    public async Task<string> UploadFileAsync(IFormFile file, string key)
    {
        if (_client is null)
            throw new InvalidOperationException("R2 storage is not configured.");

        using var stream = file.OpenReadStream();
        if (stream.CanSeek)
            stream.Position = 0;

        var response = await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true
        });

        if (response.HttpStatusCode is not System.Net.HttpStatusCode.OK)
            throw new InvalidOperationException($"R2 upload failed with status {response.HttpStatusCode}.");

        return $"{_publicUrl}/{key}";
    }

    public async Task DeleteFileAsync(string key)
    {
        if (_client is null) return;
        await _client.DeleteObjectAsync(_bucketName, key);
    }

    public bool IsR2Url(string? url) =>
        !string.IsNullOrWhiteSpace(url)
        && !string.IsNullOrWhiteSpace(_publicUrl)
        && url.StartsWith(_publicUrl, StringComparison.OrdinalIgnoreCase);

    public string GetKeyFromUrl(string url)
    {
        var prefix = _publicUrl + "/";
        return url.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? url[prefix.Length..]
            : url.TrimStart('/');
    }
}
